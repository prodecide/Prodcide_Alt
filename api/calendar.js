/**
 * Serverless API handler for Google Calendar Event Creation & Google Meet Link Generation
 */

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { accessToken, summary, description, date, slot, clientEmail, consultantEmail } = req.body;

    if (!accessToken) {
        return res.status(400).json({ error: 'Google OAuth access token is required' });
    }

    if (!date || !slot) {
        return res.status(400).json({ error: 'Date and slot are required' });
    }

    try {
        const [year, month, day] = date.split('-').map(Number);
        const [hours, minutes] = slot.split(':').map(Number);
        
        const startDate = new Date(year, month - 1, day, hours, minutes);
        const endDate = new Date(startDate.getTime() + 45 * 60 * 1000); // 45 minutes

        const attendees = [];
        if (clientEmail) attendees.push({ email: clientEmail });
        if (consultantEmail) attendees.push({ email: consultantEmail });

        const eventPayload = {
            summary: summary || 'ProDecide Consultation Session',
            description: description || 'Professional advisory session scheduled via ProDecide.',
            start: {
                dateTime: startDate.toISOString(),
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
            },
            end: {
                dateTime: endDate.toISOString(),
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
            },
            attendees,
            conferenceData: {
                createRequest: {
                    requestId: `pd-meet-${Date.now()}`,
                    conferenceSolutionKey: {
                        type: 'hangoutsMeet'
                    }
                }
            },
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 24 * 60 },
                    { method: 'popup', minutes: 30 }
                ]
            }
        };

        const googleResponse = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventPayload)
        });

        const data = await googleResponse.json();

        if (!googleResponse.ok) {
            console.error('Google Calendar API Error:', data);
            return res.status(googleResponse.status).json({
                error: data.error?.message || 'Failed to create event in Google Calendar',
                details: data
            });
        }

        return res.status(200).json({
            success: true,
            eventId: data.id,
            htmlLink: data.htmlLink,
            meetLink: data.hangoutLink || data.conferenceData?.entryPoints?.find(ep => ep.entryPointType === 'video')?.uri,
            status: data.status
        });

    } catch (err) {
        console.error('Calendar handler server error:', err);
        return res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
}

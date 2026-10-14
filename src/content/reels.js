// Reel reference sections. Each published entry shows on /references and has its own page at
// /r/<slug> that you can send to people who comment on the reel.
//
// To add a reel: copy an entry, change the text, set published: true, then deploy.
// Newest reels go at the top. Entries with published: false are hidden everywhere.
//
// instagramUrl  the public reel link (it is embedded on the page)
// link          the main thing the reel recommends (button)
// howToUse      short steps, in order
// resources     optional extra links; type: 'article' | 'video' | 'pdf' | 'tool' | 'course' | 'book' | 'other'

export const reels = [
  {
    slug: 'claude-firecrawl-jobs',
    published: true,
    heading: 'Job search reel',
    title: 'Find the right jobs with Claude and Firecrawl in one prompt',
    instagramUrl: 'https://www.instagram.com/pro.decide/reel/DecRT6YPb9Z/',
    description:
      'Stop applying to 100 jobs blindly. Firecrawl lets Claude read job sites for you, so you can ask for the roles you want in plain English and get a clean list back in minutes. Then use Claude to tailor your resume to each role and prepare for the interview.',
    link: { label: 'Open Firecrawl', url: 'https://www.firecrawl.dev' },
    howToUse: [
      'Go to firecrawl.dev and sign up. Click Start for free.',
      'After you sign in, find the page that shows your MCP server URL, and copy it. This link contains your personal key, so never share it or post it.',
      'Open Claude Desktop. Click the + button, choose Connectors, then Add custom connector. Give it a name, such as Firecrawl, paste the MCP server URL and confirm.',
      'Turn the Firecrawl connector on in your chat. Then type /firecrawl-scrape followed by what you want, for example: Find product manager jobs in Bangalore for 4 years of experience, with company, role and when each was posted. Change the role, city and experience to match you.',
      'Ask Claude to put the list in a spreadsheet. Then pick a role you like and ask Claude to tailor your resume to it and prepare you for that interview.',
    ],
    resources: [],
  },
  {
    slug: 'roadmap-sh',
    published: true,
    heading: 'Roadmap reel',
    title: 'Not sure what to learn next in tech? Follow a roadmap.',
    instagramUrl: 'https://www.instagram.com/pro.decide/reel/DeBpwtRv65s/',
    description:
      'roadmap.sh is a free platform with learning roadmaps created by its community for developers, product managers, AI engineers, data analysts, DevOps engineers and more. Whether you are a beginner or switching careers, it shows what to learn and in what order, so you can skip the random tutorials.',
    link: { label: 'Open roadmap.sh', url: 'https://roadmap.sh' },
    howToUse: [
      'Go to roadmap.sh.',
      'Pick the roadmap that matches your goal, such as Developer, Product Manager, AI Engineer, Data Analyst or DevOps Engineer.',
      'Follow the path step by step, in the order it shows.',
      'Save the reel and the link, so you can come back as you progress.',
    ],
    resources: [],
  },
];

export const publishedReels = reels.filter((r) => r.published);
export const findReel = (slug) => publishedReels.find((r) => r.slug === slug);

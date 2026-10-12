// Reel reference pages. Each entry becomes a public page at  prodecide.co.in/r/<slug>
// that you can send to people who comment on the reel.
//
// To add a reel: copy the example below, change the text, set published: true, then deploy.
// Newest reels go at the top. Reels with published: false are hidden everywhere.
//
// type: 'article' | 'video' | 'pdf' | 'tool' | 'course' | 'book' | 'other'

export const reels = [
  {
    slug: 'example-reel', // the page address: /r/example-reel (lowercase letters, numbers, hyphens)
    published: false, // set to true to publish
    title: 'Resources from my reel on switching careers',
    summary: 'Thanks for commenting. Here are the links I mentioned in the reel.',
    reelUrl: '', // optional: link to the Instagram reel
    resources: [
      {
        title: 'Example guide title',
        url: 'https://example.com/guide',
        description: 'One line on why this is useful.',
        type: 'article',
      },
    ],
  },
];

export const publishedReels = reels.filter((r) => r.published);
export const findReel = (slug) => publishedReels.find((r) => r.slug === slug);

import type {
  BankAccount,
  ContactPerson,
  FaqItem,
  GalleryCategory,
  HotelRecommendation,
  StoryChapter,
  VoiceStatement,
  WeddingEvent,
  WeddingPartyMember,
} from "@/types";

export type {
  BankAccount,
  ContactPerson,
  FaqItem,
  GalleryCategory,
  HotelRecommendation,
  StoryChapter,
  VoiceStatement,
  WeddingEvent,
  WeddingPartyMember,
};

export const IMAGE_CATEGORIES: Record<string, Exclude<GalleryCategory, "Guest">> = {
  "Copy of DSC08271.jpg": "Together",
  "Copy of IMG_8728.JPG": "Together",
  "EMM_9139_(2).jpg": "Together",
  "EMM_9157_(2).jpg": "Together",
  "EMM_9276.jpg": "Together",
  "EMM_9309.jpg": "Together",
  "EMM_9321.jpg": "Together",
  "EMM_9369_(2).jpg": "Together",
  "EMM_9388_(2).jpg": "Together",
  "EMM_9399_(2).jpg": "Together",
  "WhatsApp Image 2026-11-19 at 06.52.10 2.jpeg": "Her",
  "WhatsApp Image 2026-11-19 at 06.52.11 2.jpeg": "Her",
  "WhatsApp Image 2026-11-19 at 06.52.12 2.jpeg": "Together",
  "WhatsApp Image 2026-11-19 at 06.52.13 (1).jpeg": "Together",
  "WhatsApp Image 2026-11-19 at 06.52.13 2.jpeg": "Together",
  "WhatsApp Image 2026-11-21 at 07.06.07.jpeg": "Her",
  "WhatsApp Image 2026-11-22 at 11.06.10.jpeg": "Him",
};

export const IMAGE_SLOTS = {
  heroMobile: "EMM_9276.jpg",
  heroDesktop: "EMM_9139_(2).jpg",
  story: [
    "EMM_9139_(2).jpg",
    "EMM_9157_(2).jpg",
    "EMM_9399_(2).jpg",
    "EMM_9369_(2).jpg",
    "EMM_9388_(2).jpg",
    "EMM_9309.jpg",
    "EMM_9321.jpg",
    "WhatsApp Image 2026-11-19 at 06.52.13 2.jpeg",
    "EMM_9276.jpg",
  ],
  weddingParty: {
    // TODO: Add Best Man and Best Lady photos when available
  } as Record<string, string>,
};

/** Files excluded from the public couple gallery (exact duplicates only). */
export const IMAGE_EXCLUDED: string[] = [
  "WhatsApp Image 2026-11-19 at 06.52.11.jpeg",
  "WhatsApp Image 2026-11-19 at 06.52.12.jpeg",
  "WhatsApp Image 2026-11-19 at 06.52.13.jpeg",
];

export const IMAGE_ALT_TEXT: Record<string, string> = {
  "Copy of DSC08271.jpg":
    "Miracle holding Oludamade’s hand with a bouquet of roses beneath a red heart balloon arch at the surprise proposal",
  "Copy of IMG_8728.JPG":
    "Oludamade beaming with joy as she hugs Miracle tightly after saying yes on 24 July 2026",
  "EMM_9139_(2).jpg":
    "Oludamade and Miracle standing hand in hand in blush pink and white studio attire, smiling warmly at each other",
  "EMM_9157_(2).jpg":
    "Seated pre-wedding portrait of Oludamade in a blush pink satin gown resting close to Miracle",
  "EMM_9276.jpg":
    "Intimate traditional portrait of Oludamade and Miracle cheek to cheek in magenta, onion-lilac and deep purple attire",
  "EMM_9309.jpg":
    "Regal seated traditional portrait of Oludamade with her arm around Miracle in lilac and purple attire",
  "EMM_9321.jpg":
    "Miracle kissing Oludamade on the cheek as she laughs radiantly in traditional attire",
  "EMM_9369_(2).jpg":
    "Oludamade and Miracle standing closely together holding hands in classic black formal attire",
  "EMM_9388_(2).jpg":
    "Tender studio portrait of Miracle kissing Oludamade’s cheek as she shows her engagement ring",
  "EMM_9399_(2).jpg":
    "Classic black-tie portrait of Oludamade seated beside Miracle in a tailored black suit",
  "WhatsApp Image 2026-11-19 at 06.52.10 2.jpeg":
    "Oludamade in a yellow dress showing her engagement ring beneath the neon Will You Marry Me sign",
  "WhatsApp Image 2026-11-19 at 06.52.11 2.jpeg":
    "Oludamade laughing joyfully with her bouquet of red and white roses at her surprise proposal",
  "WhatsApp Image 2026-11-19 at 06.52.11.jpeg":
    "Oludamade laughing joyfully with her bouquet of red and white roses at her surprise proposal",
  "WhatsApp Image 2026-11-19 at 06.52.12 2.jpeg":
    "Oludamade embracing Miracle after the proposal with her engagement ring shining on her hand",
  "WhatsApp Image 2026-11-19 at 06.52.12.jpeg":
    "Oludamade embracing Miracle after the proposal with her engagement ring shining on her hand",
  "WhatsApp Image 2026-11-19 at 06.52.13 (1).jpeg":
    "Miracle and Oludamade sharing a warm hug beside the red balloon heart arch",
  "WhatsApp Image 2026-11-19 at 06.52.13 2.jpeg":
    "Miracle and Oludamade smiling happily together beneath the red heart balloon arch and Will You Marry Me sign",
  "WhatsApp Image 2026-11-19 at 06.52.13.jpeg":
    "Miracle and Oludamade smiling happily together beneath the red heart balloon arch and Will You Marry Me sign",
  "WhatsApp Image 2026-11-21 at 07.06.07.jpeg":
    "Solo portrait of Oludamade smiling outdoors in a royal blue blouse",
  "WhatsApp Image 2026-11-22 at 11.06.10.jpeg":
    "Solo portrait of Miracle in crisp white native attire and sunglasses",
};

export const SITE = {
  couple: {
    displayNames: "Oludamade & Miracle",
    brideShort: "Oludamade",
    groomShort: "Miracle",
    brideFull: "Oludamade Ronke Okunade",
    groomFull: "Miracle Olaoluwa Alao",
    monogram: "O & M",
    hashtag: "#aDMeverAfter",
    tagline: "It started with a Hello. It ends with forever.",
    dateDisplay: "Saturday, 5 December 2026",
    dateShort: "5 December 2026",
    locationDisplay: "Ilorin, Kwara State, Nigeria",
    locationShort: "Ilorin, Nigeria",
    timeZone: "Africa/Lagos",
    weddingStartIsoWat: "2026-12-05T07:30:00+01:00",
    proposalDate: "24 July 2026",
    firstHelloDate: "1 August 2024",
  },

  /** Optional top notice banner for last-minute updates. Set enabled: true to display. */
  updateBanner: {
    enabled: false,
    message:
      "We’re counting down to 5 December 2026 in Ilorin! Check back here for any day-of updates.",
  },

  /** Set to false when you want search engines to index the site (TODO: confirm with couple). */
  robotsNoIndex: true,

  /** TODO: confirm final RSVP deadline date (ISO with WAT offset). */
  rsvpDeadlineIsoWat: "2026-11-25T23:59:59+01:00",
  rsvpDeadlineDisplay: "25 November 2026 (TODO: confirm deadline)",

  coloursOfTheDay: [
    { name: "Magenta", hex: "#A3195B" },
    { name: "Onion", hex: "#B98AA8" },
    { name: "Sage Green", hex: "#9DB08A" },
    { name: "White", hex: "#FFFFFF" },
  ],
  dressCodeLine: "There’s no strict dress code. Just come in our colours.",

  navLinks: [
    { label: "Our story", href: "#story" },
    { label: "The day", href: "#the-day" },
    { label: "Stay", href: "#stay" },
    { label: "Gallery", href: "#gallery" },
    { label: "Share photos", href: "#share-photos" },
    { label: "Gifts", href: "#gifts" },
    { label: "FAQ", href: "#faq" },
  ],

  storyChapters: [
    {
      id: "introduction",
      number: 1,
      title: "The introduction",
      dateLabel: "Summer 2024",
      imageFile: IMAGE_SLOTS.story[0],
      statements: [
        {
          speaker: "Miracle",
          initial: "M",
          text: "“A friend told me, ‘I’d love to introduce you to a lady. I hope you’ll treat her right.’ She was writing her exams, so I waited about a week for her to finish.”",
        },
      ],
    },
    {
      id: "the-hello",
      number: 2,
      title: "The Hello",
      dateLabel: "1 August 2024",
      imageFile: IMAGE_SLOTS.story[1],
      statements: [
        {
          speaker: "Miracle",
          initial: "M",
          text: "“On 1 August 2024, I sent her my first ‘Hello’ on WhatsApp. After a few exchanges of greetings, I didn’t want to continue, so I ghosted her last message. (I promise I’ve improved.) A few days later, she told the friend who introduced us that I’d stopped responding. Then I thought, what could be bad about adding one more person to my short list of friends?”",
        },
      ],
    },
    {
      id: "why-i-replied",
      number: 3,
      title: "Why I replied",
      imageFile: IMAGE_SLOTS.story[2],
      statements: [
        {
          speaker: "Oludamade",
          initial: "O",
          text: "“I never knew what exactly pushed me to become friends with Miracle. I rarely respond to messages on WhatsApp, especially from random guys. But I took a special interest in his message and decided to keep the conversation going. I probably didn’t know I was meeting someone who would become such a huge part of my life. I liked his personality, and getting to know him became something I looked forward to.”",
        },
        {
          speaker: "Miracle",
          initial: "M",
          text: "“I wasn’t searching for a companion or looking to start any relationship. I just wanted to be on my own. A few moments into our conversation, it became clear this was who I wanted to spend the rest of my life with.”",
        },
      ],
    },
    {
      id: "chats-became-calls",
      number: 4,
      title: "Chats became calls",
      imageFile: IMAGE_SLOTS.story[3],
      statements: [
        {
          speaker: "Miracle",
          initial: "M",
          text: "“Chats turned into calls, conversations started lasting for hours, we went on different dates, and before I knew it, Oludamade became the air I breathe.”",
        },
        {
          speaker: "Oludamade",
          initial: "O",
          text: "“Our first meeting felt so effortless. It was like we’d known each other for a long time. The conversation flowed and there was no awkwardness at all. I think that’s what made the beginning of our friendship so special.”",
        },
      ],
    },
    {
      id: "what-we-see",
      number: 5,
      title: "What we see in each other",
      imageFile: IMAGE_SLOTS.story[4],
      statements: [
        {
          speaker: "Miracle",
          initial: "M",
          text: "“She has a calm, loving and extraordinary personality. Her smile is so enticing that it calms every bit of worry. Forever is such a short distance. Forever and more is how long we’ll stay glued to each other, Babe.”",
        },
        {
          speaker: "Oludamade",
          initial: "O",
          text: "“Miracle is so loving and caring. He makes me his priority, and I love him so much for it.”",
        },
      ],
    },
    {
      id: "our-journey",
      number: 6,
      title: "Our journey so far",
      imageFile: IMAGE_SLOTS.story[5],
      statements: [
        {
          speaker: "Oludamade",
          initial: "O",
          text: "“We’ve had beautiful moments, disagreements, lessons and growth. We’ve met each other’s families, celebrated milestones and learned a lot about each other. It’s been a beautiful journey, honestly.”",
        },
      ],
    },
    {
      id: "gist-and-laughter",
      number: 7,
      title: "Gist, laughter and playful arguments",
      imageFile: IMAGE_SLOTS.story[6],
      statements: [
        {
          speaker: "Oludamade",
          initial: "O",
          text: "“Our playful arguments, and the way we disturb each other. There’s always gist, laughter and one thing or another to talk about. I love how we can joke around, have serious conversations and still be completely comfortable with each other. ❤️”",
        },
      ],
    },
    {
      id: "the-surprise",
      number: 8,
      title: "The surprise",
      dateLabel: "24 July 2026",
      tag: "Everyone knew except her 🤫",
      imageFile: IMAGE_SLOTS.story[7],
      statements: [
        {
          speaker: "Oludamade",
          initial: "O",
          text: "“Miracle planned everything with my sisters, and I had no idea! I was told I was going for an office dinner. Dade even made my dress, and Aunty Bola & Rachael helped me get ready. Everybody knew except me. It was such a beautiful surprise, and I gave him the easiest YES!”",
        },
        {
          speaker: "Miracle",
          initial: "M",
          text: "“On 24 July 2026, I bent the knee and asked Oludamade to marry me, and she gladly said yes. It was one of the most beautiful moments of my life. Every time I look at the pictures, I can’t help laughing hysterically.”",
        },
      ],
    },
    {
      id: "the-big-day",
      number: 9,
      title: "The big day",
      dateLabel: "5 December 2026",
      imageFile: IMAGE_SLOTS.story[8],
      statements: [
        {
          speaker: "Both",
          initial: "O&M",
          text: "“Now we’re saying ‘I do’. We’d be honoured to have you with us.”",
        },
      ],
    },
  ] as StoryChapter[],

  events: [
    {
      id: "engagement",
      name: "Engagement",
      shortTime: "7:30 AM",
      timeDisplay: "7:30 AM (WAT)",
      startIsoWat: "2026-12-05T07:30:00+01:00",
      endIsoWat: "2026-12-05T10:15:00+01:00",
      venue: "Excellence Hall",
      address: "Excellence Hall, Pipeline Area, Ilorin, Kwara State, Nigeria",
      mapsQuery: "Excellence Hall, Pipeline Area, Ilorin, Kwara State, Nigeria",
      mapsUrl:
        "https://www.google.com/maps/search/?api=1&query=Excellence+Hall+Pipeline+Area+Ilorin+Kwara+State+Nigeria",
      description:
        "Our traditional engagement ceremony opens the morning with family prayers, joy and celebration.",
    },
    {
      id: "church",
      name: "Church Wedding",
      shortTime: "11:00 AM",
      timeDisplay: "11:00 AM (WAT)",
      startIsoWat: "2026-12-05T11:00:00+01:00",
      endIsoWat: "2026-12-05T13:00:00+01:00",
      venue: "Emmanuel Baptist Church",
      address: "Emmanuel Baptist Church, Sabo Oke, Ilorin, Kwara State, Nigeria",
      mapsQuery: "Emmanuel Baptist Church, Sabo Oke, Ilorin, Kwara State, Nigeria",
      mapsUrl:
        "https://www.google.com/maps/search/?api=1&query=Emmanuel+Baptist+Church+Sabo+Oke+Ilorin+Kwara+State+Nigeria",
      description:
        "We exchange our vows and receive God’s blessing surrounded by our loved ones.",
    },
    {
      id: "reception",
      name: "Reception",
      shortTime: "1:30 PM",
      timeDisplay: "1:30 PM (WAT)",
      startIsoWat: "2026-12-05T13:30:00+01:00",
      endIsoWat: "2026-12-05T18:00:00+01:00",
      venue: "Excellence Hall",
      address: "Excellence Hall, Pipeline Area, Ilorin, Kwara State, Nigeria",
      mapsQuery: "Excellence Hall, Pipeline Area, Ilorin, Kwara State, Nigeria",
      mapsUrl:
        "https://www.google.com/maps/search/?api=1&query=Excellence+Hall+Pipeline+Area+Ilorin+Kwara+State+Nigeria",
      description:
        "Good food, warm toasts, music and dancing as we celebrate the start of our forever.",
    },
  ] as WeddingEvent[],

  venueDirections: [
    {
      venue: "Excellence Hall (Engagement & Reception)",
      address: "Pipeline Area, Ilorin, Kwara State",
      directions:
        "From General Hospital (before Taiwo Road), head towards Pipeline Road / Pipeline Area to reach Excellence Hall. (TODO: confirm exact landmark wording and map pin.)",
      mapsUrl:
        "https://www.google.com/maps/search/?api=1&query=Excellence+Hall+Pipeline+Area+Ilorin+Kwara+State+Nigeria",
    },
    {
      venue: "Emmanuel Baptist Church (Church Wedding)",
      address: "Sabo Oke, Ilorin, Kwara State",
      directions:
        "From General Hospital (before Taiwo Road) or Pipeline Area, head towards Sabo Oke to Emmanuel Baptist Church. (TODO: confirm exact landmark wording and map pin.)",
      mapsUrl:
        "https://www.google.com/maps/search/?api=1&query=Emmanuel+Baptist+Church+Sabo+Oke+Ilorin+Kwara+State+Nigeria",
    },
  ],

  hotels: [
    {
      name: "Suitoria Hotel",
      area: "Pipeline Road area, Ilorin",
      mapsUrl:
        "https://www.google.com/maps/search/?api=1&query=Suitoria+Hotel+Pipeline+Road+Ilorin",
      contactNote: "TODO: add hotel phone number or booking link",
    },
    {
      name: "Ager Woods Hotel",
      area: "Pipeline Road area, Ilorin",
      mapsUrl:
        "https://www.google.com/maps/search/?api=1&query=Ager+Woods+Hotel+Pipeline+Road+Ilorin",
      contactNote: "TODO: add hotel phone number or booking link",
    },
    {
      name: "Gpinnacle Hotel",
      area: "Pipeline Road area, Ilorin",
      mapsUrl:
        "https://www.google.com/maps/search/?api=1&query=Gpinnacle+Hotel+Pipeline+Road+Ilorin",
      contactNote: "TODO: add hotel phone number or booking link",
    },
    {
      name: "Signature Hotel",
      area: "Pipeline Road area, Ilorin",
      mapsUrl:
        "https://www.google.com/maps/search/?api=1&query=Signature+Hotel+Pipeline+Road+Ilorin",
      contactNote: "TODO: add hotel phone number or booking link",
    },
  ] as HotelRecommendation[],

  travelTip:
    "Please arrive early and plan for Saturday traffic. Sharing a ride helps!",

  weddingParty: [
    {
      name: "Odejimi Emmanuel",
      role: "Best Man",
      initials: "OE",
      // TODO: add Best Man photo filename when available
    },
    {
      name: "Okunade Oludadepo",
      role: "Best Lady",
      initials: "OO",
      // TODO: add Best Lady photo filename when available
    },
    // TODO: Add more groomsmen, bridesmaids and family members here.
    // Omit imageFile to display an elegant initials monogram automatically.
  ] as WeddingPartyMember[],

  gifts: {
    heading: "With gratitude",
    message:
      "Your presence is the greatest gift we could ask for. Should you wish to bless us further, we gratefully welcome gifts in cash or in kind. Thank you for celebrating with us, and may the Lord bless you richly.",
    confirmationNote: "Please confirm the account name before sending.",
    accounts: [
      {
        label: "Bride",
        accountName: "Okunade Oludamade",
        accountNumber: "1486093908",
        bankName: "Access Bank Plc",
      },
      {
        label: "Groom",
        accountName: "Alao Miracle Olaoluwa",
        accountNumber: "1513645465",
        bankName: "Access Bank Plc",
      },
    ] as BankAccount[],
  },

  faqs: [
    {
      id: "when-and-where",
      question: "When and where is the wedding?",
      answer:
        "Saturday, 5 December 2026, in Ilorin, Kwara State. Our Engagement is at 7:30 AM and our Reception at 1:30 PM, both at Excellence Hall (Pipeline Area). The Church Wedding is at 11:00 AM at Emmanuel Baptist Church (Sabo Oke).",
    },
    {
      id: "dress-code",
      question: "Is there a dress code?",
      answer:
        "There’s no strict dress code. Please come in our colours of the day: Magenta, Onion, Sage Green and White.",
    },
    {
      id: "colours",
      question: "What are the colours of the day?",
      answer: "Magenta, Onion, Sage Green and White.",
      showColourSwatches: true,
    },
    {
      id: "same-venue",
      question: "Are the Engagement and Reception at the same venue?",
      answer:
        "Yes, both are at Excellence Hall, Pipeline Area, Ilorin. The Church Wedding is at Emmanuel Baptist Church, Sabo Oke, in between.",
    },
    {
      id: "arrival-time",
      question: "What time should I arrive?",
      answer:
        "We suggest 20 to 30 minutes early for each event so you can settle in comfortably.",
    },
    {
      id: "where-to-stay",
      question: "Where can I stay in Ilorin?",
      answer:
        "Suitoria Hotel, Ager Woods Hotel, Gpinnacle Hotel and Signature Hotel, all around Pipeline Road, close to the reception.",
    },
    {
      id: "how-to-rsvp",
      question: "How do I RSVP?",
      answer:
        "Use the RSVP form on this page, or message Olayinka or Oludadepo on WhatsApp.",
    },
    {
      id: "guests-children",
      question: "Can I bring a guest or children?",
      answer:
        "Please check your invitation and enter the number of guests on the RSVP form. For anything else, message us on WhatsApp. (TODO: confirm plus-one and children policy.)",
    },
    {
      id: "parking-security",
      question: "Is there parking and security?",
      answer:
        "TODO: confirm parking and security details with Excellence Hall and Emmanuel Baptist Church.",
    },
    {
      id: "taking-photos",
      question: "Can I take photos?",
      answer:
        "Please do! We’d love to see them. Share them on this website (look for the QR code on the tables) or with #aDMeverAfter. (TODO: confirm if the church ceremony is phone-free.)",
    },
    {
      id: "share-photos",
      question: "How do I share my photos?",
      answer:
        "Scan the QR code on the table cards, tap “Add your photos” and you’re done. No login needed.",
    },
    {
      id: "changes",
      question: "What if something changes?",
      answer:
        "Updates will appear on this website, and our contacts will keep you informed.",
    },
    {
      id: "send-gift",
      question: "How can I send a gift?",
      answer:
        "Your presence is our greatest gift. If you’d like to bless us further, our account details are in the Gifts section.",
    },
    {
      id: "contact",
      question: "Who do I contact?",
      answer:
        "Olayinka (+234 810 038 0726) or Oludadepo (+234 701 265 8858), by call or WhatsApp.",
    },
    {
      id: "last-minute-changes",
      question: "How will I know about last-minute changes?",
      answer:
        "An update banner at the top of this website will display any last-minute notices right away, and Olayinka or Oludadepo will also keep everyone informed on WhatsApp.",
    },
  ] as FaqItem[],

  contacts: [
    {
      name: "Olayinka",
      role: "Wedding Coordinator (TODO: confirm role)",
      phoneDisplay: "+234 810 038 0726",
      whatsappNumber: "2348100380726",
      telHref: "tel:+2348100380726",
    },
    {
      name: "Oludadepo",
      role: "Best Lady & Family Contact",
      phoneDisplay: "+234 701 265 8858",
      whatsappNumber: "2347012658858",
      telHref: "tel:+2347012658858",
    },
  ] as ContactPerson[],
};

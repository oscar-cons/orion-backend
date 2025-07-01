export type Source = {
  id: string;
  name: string;
  type: 'Forum' | 'Marketplace' | 'Blog' | 'Social Media';
  nature: 'Hacking' | 'Carding' | 'Drugs' | 'Leaks' | 'General';
  status: 'Active' | 'Inactive';
  origin: 'Tor' | 'I2P' | 'Clearnet';
  language: string;
  country: string;
  tags: string[];
  monitoringStatus: 'Monitored' | 'Unmonitored';
  description: string;
  urls: string[];
  admin: {
    name: string;
    contact: string;
  };
  userMetrics: {
    users: number;
    posts: number;
    threads: number;
  };
  screenshotUrl: string;
};

export type SourceContent = {
  id: string;
  title: string;
  author: string;
  date: string;
  content: string;
};

export const dashboardMetrics = {
  totalSources: 125,
  active: 98,
  inactive: 27,
};

export const countryDistribution = [
  { name: 'Russia', value: 35, fill: 'hsl(var(--chart-1))' },
  { name: 'USA', value: 22, fill: 'hsl(var(--chart-2))' },
  { name: 'Germany', value: 15, fill: 'hsl(var(--chart-3))' },
  { name: 'Netherlands', value: 11, fill: 'hsl(var(--chart-4))' },
  { name: 'Ukraine', value: 8, fill: 'hsl(var(--chart-5))' },
  { name: 'Other', value: 34, fill: 'hsl(var(--muted))' },
];

export const sources: Source[] = [
    {
    id: 'forox',
    name: 'ForoX',
    type: 'Forum',
    nature: 'Hacking',
    status: 'Active',
    origin: 'Tor',
    language: 'Spanish',
    country: 'Spain',
    tags: ['malware', 'exploit', 'ddos'],
    monitoringStatus: 'Monitored',
    description: 'Prominent Spanish-speaking hacking forum focused on malware development and trading.',
    urls: ['http://foroxh2v2k3r.onion'],
    admin: { name: 'AdminX', contact: 'adminx@forox.onion' },
    userMetrics: { users: 15000, posts: 250000, threads: 12000 },
    screenshotUrl: 'https://placehold.co/600x400'
  },
  {
    id: 'dark-market',
    name: 'Dark Market',
    type: 'Marketplace',
    nature: 'Carding',
    status: 'Active',
    origin: 'Tor',
    language: 'English',
    country: 'USA',
    tags: ['cc', 'dumps', 'paypal'],
    monitoringStatus: 'Monitored',
    description: 'A large marketplace for stolen credit card data and financial fraud tools.',
    urls: ['http://darkmktl3er4.onion'],
    admin: { name: 'DM_Admin', contact: 'admin@darkmkt.onion' },
    userMetrics: { users: 50000, posts: 1200000, threads: 45000 },
    screenshotUrl: 'https://placehold.co/600x400'
  },
  {
    id: 'psy-net',
    name: 'PsyNet',
    type: 'Forum',
    nature: 'Drugs',
    status: 'Inactive',
    origin: 'I2P',
    language: 'English',
    country: 'Netherlands',
    tags: ['psychedelics', 'research'],
    monitoringStatus: 'Unmonitored',
    description: 'A forum dedicated to the discussion and trade of psychedelic substances. Currently offline.',
    urls: ['http://psyneti2p.i2p'],
    admin: { name: 'Psychonaut', contact: 'n/a' },
    userMetrics: { users: 5000, posts: 80000, threads: 3000 },
    screenshotUrl: 'https://placehold.co/600x400'
  },
  {
    id: 'breach-world',
    name: 'BreachWorld',
    type: 'Blog',
    nature: 'Leaks',
    status: 'Active',
    origin: 'Clearnet',
    language: 'English',
    country: 'Russia',
    tags: ['database', 'leaks', 'breach'],
    monitoringStatus: 'Monitored',
    description: 'A blog-style site that aggregates and sells access to breached databases.',
    urls: ['https://breachworld.com'],
    admin: { name: 'LeakGod', contact: 'leakgod@protonmail.com' },
    userMetrics: { users: 1000, posts: 500, threads: 500 },
    screenshotUrl: 'https://placehold.co/600x400'
  },
  {
    id: 'hack-squad',
    name: 'HackSquad',
    type: 'Social Media',
    nature: 'General',
    status: 'Active',
    origin: 'Clearnet',
    language: 'Russian',
    country: 'Russia',
    tags: ['community', 'scripting'],
    monitoringStatus: 'Unmonitored',
    description: 'A Telegram channel for aspiring hackers and script kiddies.',
    urls: ['https://t.me/hacksquadrus'],
    admin: { name: 'RusAdmin', contact: '@rusadmin' },
    userMetrics: { users: 25000, posts: 15000, threads: 0 },
    screenshotUrl: 'https://placehold.co/600x400'
  },
];

export const getSourceById = (id: string): Source | undefined => {
  return sources.find((source) => source.id === id);
}

export const getSourceContent = (id: string): SourceContent[] => {
  // Mock content, in a real app this would be a specific API call
  return [
    {
      id: 'post1',
      title: 'New Zeus Botnet Variant C&C',
      author: 'UserX123',
      date: '2024-05-20',
      content: 'Just released a new variant of the Zeus botnet. More resilient against takedowns. PM for details and pricing. Not for beginners.',
    },
    {
      id: 'post2',
      title: 'Fresh US CC Dumps - 95% validity',
      author: 'CardMasterFlex',
      date: '2024-05-19',
      content: 'Got a fresh batch of 10k US credit card dumps. High balance, 95% validity guaranteed. Escrow accepted. Bulk deals available.',
    },
    {
      id: 'post3',
      title: 'Looking for DDoS partner',
      author: 'NetworkSlayer',
      date: '2024-05-18',
      content: 'I have a powerful botnet, looking for a partner to monetize it for DDoS-for-hire services. Must have reputation. Split is 50/50.',
    },
     {
      id: 'post4',
      title: 'Selling 0-day for Windows 11',
      author: 'ExploitBroker',
      date: '2024-05-17',
      content: 'Private 0-day remote code execution exploit for fully patched Windows 11. Serious inquiries only. Price is 50 BTC. Video proof available for verified buyers.',
    },
  ]
}

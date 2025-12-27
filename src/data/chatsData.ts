export interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
}

export const chatsData: Chat[] = [
  {
    id: '1',
    name: 'John Doe',
    avatar: '👨‍💼',
    lastMessage: 'Hey! How are you doing today?',
    timestamp: '10:30 AM',
    unreadCount: 3,
    isOnline: true,
  },
  {
    id: '2',
    name: 'Sarah Wilson',
    avatar: '👩‍🦰',
    lastMessage: 'Can we schedule a meeting tomorrow?',
    timestamp: '9:45 AM',
    unreadCount: 1,
    isOnline: true,
  },
  {
    id: '3',
    name: 'Team React Native',
    avatar: '👥',
    lastMessage: 'Alice: The new feature is ready for testing',
    timestamp: 'Yesterday',
    unreadCount: 12,
    isOnline: false,
  },
  {
    id: '4',
    name: 'Mike Johnson',
    avatar: '👨‍💻',
    lastMessage: 'Thanks for the help! 👍',
    timestamp: 'Yesterday',
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: '5',
    name: 'Emma Davis',
    avatar: '👩‍🎨',
    lastMessage: 'I sent you the designs',
    timestamp: 'Tuesday',
    unreadCount: 0,
    isOnline: true,
  },
  {
    id: '6',
    name: 'Dev Team',
    avatar: '💻',
    lastMessage: 'Code review needed for PR #234',
    timestamp: 'Monday',
    unreadCount: 5,
    isOnline: false,
  },
  {
    id: '7',
    name: 'Robert Brown',
    avatar: '🧑‍🔧',
    lastMessage: 'The bug has been fixed',
    timestamp: 'Sunday',
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: '8',
    name: 'Lisa Anderson',
    avatar: '👩‍⚕️',
    lastMessage: 'See you at the conference!',
    timestamp: 'Saturday',
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: '9',
    name: 'Project Alpha',
    avatar: '🚀',
    lastMessage: 'Sprint planning tomorrow at 10 AM',
    timestamp: 'Friday',
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: '10',
    name: 'David Lee',
    avatar: '👨‍🏫',
    lastMessage: 'Great work on the presentation!',
    timestamp: 'Thursday',
    unreadCount: 0,
    isOnline: false,
  },
];

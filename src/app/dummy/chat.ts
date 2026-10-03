export enum ChatTypeEnum {
  text = 'text',
  voice = 'voice',
  link = 'link',
  image = 'image',
  video = 'video',
  attachmentFile = 'attachment-file',
}

export const CHAT_ROOM_TYPE_OBJ = {
  PRIVATE: { key: 1, name: 'Private' },
  GROUP: { key: 2, name: 'Group' }
}

export enum ChatStatusEnum {
  sent = 'send',
  delivered = 'delivered',
  seen = 'seen',
  error = 'error',
  notDelivered = 'not-delivered'
}

export const Chats: Array<any> = [
  {
    type: 'text',
    value: 'Hello',
    dateTime: new Date(),
    user: {
      key: 'bcd',
      profile: '/assets/images/boy.png'
    },
    status: 'Seen'
  },
  {
    type: 'text',
    value: 'Ohh! Hi.',
    dateTime: new Date(),
    user: {
      key: 'abc',
      profile: '/assets/images/girl.png'
    },
    status: 'Seen'
  },
  {
    type: 'text',
    value: 'How are you?',
    dateTime: new Date(),
    user: {
      key: 'bcd',
      profile: '/assets/images/boy.png'
    },
    status: 'Seen'
  },
  {
    type: 'text',
    value: 'Im really great here.',
    dateTime: new Date(),
    user: {
      key: 'abc',
      profile: '/assets/images/girl.png'
    },
    status: 'Seen'
  },
  {
    type: 'text',
    value: 'How about you, Seakmeng?',
    dateTime: new Date(),
    user: {
      key: 'abc',
      profile: '/assets/images/girl.png'
    },
    status: 'Seen'
  },
  {
    type: 'text',
    value: 'Yeah. I really do enjoy living here, Phnom Penh. Phnom Penh is a really magnificent and amazing city in southest asia. People are really friendly and helpful.',
    dateTime: new Date(),
    user: {
      key: 'bcd',
      profile: '/assets/images/boy.png'
    },
    status: 'Seen'
  },
  {
    type: 'text',
    value: `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text
    ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived
    not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the
    1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like
    Aldus PageMaker including versions of Lorem Ipsum.`,
    dateTime: new Date(),
    user: {
      key: 'abc',
      profile: '/assets/images/girl.png'
    },
    status: 'Seen'
  },
];

export const GraphQLFields = {
  profile:
    'name,username,profile_pic,follower_count,is_user_follow_business,is_business_follow_user,user_id,account_type',
  conversations:
    'conversations{id,name,messages{id,created_time,from,to,message,attachments,shares,sticker,story,reactions,tags},participants,can_reply}',
  messages:
    'messages{id,created_time,from,to,message,attachments,shares,sticker,story,reactions,tags,is_unsupported},participants',
  messageContent:
    'id,created_time,from,to,message,attachments,shares,sticker,story,reactions,tags,is_unsupported',
};

export const MAX_INSTAGRAM_MESSAGE_LENGTH = 1000;

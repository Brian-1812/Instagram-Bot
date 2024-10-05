import * as Joi from 'joi';

export const validationSchema = Joi.object({
  INSTA_ACCOUNT_ACCESS_TOKEN: Joi.string().required(),
  INSTA_VERIFY_TOKEN: Joi.string().required(),
  MYSQL_HOST: Joi.string().required().default('127.0.0.1'),
  MYSQL_PORT: Joi.number().required().default(3306),
  MYSQL_USERNAME: Joi.string().required(),
  MYSQL_PASSWORD: Joi.string().required(),
  MYSQL_DB: Joi.string().required(),
  REDIS_HOST: Joi.string().required().default('localhost'),
  REDIS_PORT: Joi.number().required().default(6379),
  REDIS_PASSWORD: Joi.string(),
  NODE_ENV: Joi.string()
    .valid('production', 'development')
    .required()
    .default('development'),
});

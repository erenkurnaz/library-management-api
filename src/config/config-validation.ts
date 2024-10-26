import * as Joi from 'joi';
import { RuntimeMode } from './types/config';

export const configValidation = Joi.object({
  MODE: Joi.string()
    .valid(RuntimeMode.DEVELOPMENT, RuntimeMode.PRODUCTION, RuntimeMode.TEST),
  PORT: Joi.number().required(),
  POSTGRES_DB: Joi.string().required(),
  POSTGRES_HOST: Joi.string().required(),
  POSTGRES_USER: Joi.string().required(),
  POSTGRES_PASSWORD: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
});

import * as service from '../services/authService.js';
import Joi from 'joi';
import { ok, created, fail } from '../../../utils/response.js';

function handle(res, promise, createdFlag = false) {
  promise.then(data => {
    if (createdFlag) return created(res, data);
    ok(res, data);
  }).catch(err => fail(res, 400, err.message));
}

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().min(2).required(),
  role: Joi.string().valid('Student','Teacher','Admin').optional()
});

export function register(req, res) {
  const { error, value } = registerSchema.validate(req.body);
  if (error) return fail(res, 400, error.message);
  handle(res, service.registerLocal(value), true);
}

const loginSchema = Joi.object({ email: Joi.string().email().required(), password: Joi.string().required() });
export function login(req, res) {
  const { error, value } = loginSchema.validate(req.body);
  if (error) return fail(res, 400, error.message);
  handle(res, service.loginLocal(value));
}

const googleSchema = Joi.object({ idToken: Joi.string().required() });
export function google(req, res) {
  const { error, value } = googleSchema.validate(req.body);
  if (error) return fail(res, 400, error.message);
  handle(res, service.loginGoogle(value));
}

const refreshSchema = Joi.object({ refreshToken: Joi.string().required() });
export function refresh(req, res) {
  const { error, value } = refreshSchema.validate(req.body);
  if (error) return fail(res, 400, error.message);
  handle(res, service.refreshSession({ token: value.refreshToken }));
}

export function logout(req, res) {
  const { refreshToken } = req.body;
  handle(res, service.logout({ refreshToken }));
}

export function me(req, res) {
  // user already set by middleware
  ok(res, { user: req.user });
}

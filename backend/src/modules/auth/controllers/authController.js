import * as service from '../services/authService.js';
import Joi from 'joi';

function handle(res, promise) {
  promise.then(data => res.json(data))
    .catch(err => res.status(400).json({ error: err.message }));
}

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().min(2).required(),
  role: Joi.string().valid('Student','Teacher','Admin').optional()
});

export function register(req, res) {
  const { error, value } = registerSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });
  handle(res, service.registerLocal(value));
}

const loginSchema = Joi.object({ email: Joi.string().email().required(), password: Joi.string().required() });
export function login(req, res) {
  const { error, value } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });
  handle(res, service.loginLocal(value));
}

const googleSchema = Joi.object({ idToken: Joi.string().required() });
export function google(req, res) {
  const { error, value } = googleSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });
  handle(res, service.loginGoogle(value));
}

const refreshSchema = Joi.object({ refreshToken: Joi.string().required() });
export function refresh(req, res) {
  const { error, value } = refreshSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });
  handle(res, service.refreshSession({ token: value.refreshToken }));
}

export function logout(req, res) {
  const { refreshToken } = req.body;
  handle(res, service.logout({ refreshToken }));
}

import { swaggerSpec } from '../src/config/swagger.js';

export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json(swaggerSpec);
}

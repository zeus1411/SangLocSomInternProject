import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { generateToken } from '../utils/jwt.util';
import { ResponseUtil } from '../utils/response.util';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginDto, RegisterDto } from '../dtos/auth.dto';

export class AuthController {
  // Register new user
  async register(req: Request, res: Response) {
    try {
      const dto = plainToClass(RegisterDto, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        return ResponseUtil.badRequest(res, 'Validation failed', errors);
      }

      // Check if username exists
      const existingUser = await User.findOne({ where: { username: dto.username } });
      if (existingUser) {
        return ResponseUtil.badRequest(res, 'Username already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(dto.password, 10);

      // Create user
      const user = await User.create({
        username: dto.username,
        password: hashedPassword,
        fullname: dto.fullname,
        email: dto.email,
        isactive: true
      });

      // Generate token
      const token = generateToken({
        userId: user.id,
        username: user.username
      });

      return ResponseUtil.created(res, {
        user: {
          id: user.id,
          username: user.username,
          fullname: user.fullname,
          email: user.email
        },
        token
      }, 'User registered successfully');
    } catch (error: any) {
      console.error('Register error:', error);
      return ResponseUtil.error(res, error.message);
    }
  }

  // Login
  async login(req: Request, res: Response) {
    try {
      const dto = plainToClass(LoginDto, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        return ResponseUtil.badRequest(res, 'Validation failed', errors);
      }

      // Find user
      const user = await User.findOne({ where: { username: dto.username } });
      if (!user) {
        return ResponseUtil.unauthorized(res, 'Invalid username or password');
      }

      // Check if user is active
      if (!user.isactive) {
        return ResponseUtil.forbidden(res, 'Account is inactive');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(dto.password, user.password);
      if (!isPasswordValid) {
        return ResponseUtil.unauthorized(res, 'Invalid username or password');
      }

      // Generate token
      const token = generateToken({
        userId: user.id,
        username: user.username
      });

      return ResponseUtil.success(res, {
        user: {
          id: user.id,
          username: user.username,
          fullname: user.fullname,
          email: user.email
        },
        token
      }, 'Login successful');
    } catch (error: any) {
      console.error('Login error:', error);
      return ResponseUtil.error(res, error.message);
    }
  }

  // Get current user profile
  async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;

      const user = await User.findByPk(userId, {
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        return ResponseUtil.notFound(res, 'User not found');
      }

      return ResponseUtil.success(res, user, 'Profile retrieved successfully');
    } catch (error: any) {
      console.error('Get profile error:', error);
      return ResponseUtil.error(res, error.message);
    }
  }
}
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { generateToken } from '../utils/jwt.util';
import { ResponseUtil } from '../utils/response.util';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginDto, RegisterDto, UpdateProfileDto } from '../dtos/auth.dto';

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

  /**
   * Update User Profile - Áp dụng 3 trường hợp JWT
   * Case 1: Token hết hạn → 401, bắt login lại
   * Case 2: Token hợp lệ → lấy updatedby từ token
   * Case 3: Không có token → lấy IP address
   */
  async updateProfile(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const dto = plainToClass(UpdateProfileDto, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        return ResponseUtil.badRequest(res, 'Validation failed', errors);
      }

      const user = await User.findByPk(id);
      if (!user) {
        return ResponseUtil.notFound(res, 'User not found');
      }

      // Determine updatedby based on token availability
      let updatedBy = 'system';
      let clientIp = null;

      if (req.user?.username) {
        // Case 2: Valid token - use username from token
        updatedBy = req.user.username;
      } else {
        // Case 3: No token - capture IP address
        clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
        updatedBy = `guest_${clientIp}`;
      }

      // Update user profile (only update fields that are provided)
      const updateData: any = {};
      if (dto.fullname !== undefined) updateData.fullname = dto.fullname;
      if (dto.email !== undefined) updateData.email = dto.email;
      
      await user.update(updateData);

      // Return user without password
      const updatedUser = await User.findByPk(id, {
        attributes: { exclude: ['password'] }
      });

      return ResponseUtil.updated(res, updatedUser, 'Profile updated successfully');
    } catch (error: any) {
      console.error('Update profile error:', error);
      return ResponseUtil.error(res, error.message);
    }
  }
}
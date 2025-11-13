import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { AdminUser } from '../models/AdminUser';
import { generateToken } from '../utils/jwt.util';
import { ResponseUtil } from '../utils/response.util';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { RegisterDto, UpdateProfileDto } from '../dtos/auth.dto';

export class AuthController {
  // ============================
  // REGISTER: tạo admin_users (fullName + email + password)
  // ============================
  async register(req: Request, res: Response) {
    try {
      const dto = plainToClass(RegisterDto, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        return ResponseUtil.badRequest(res, 'Validation failed', errors);
      }

      // Check trùng email trong admin_users
      const existing = await AdminUser.findOne({ where: { email: dto.email } });
      if (existing) {
        return ResponseUtil.badRequest(res, 'Email đã tồn tại trong hệ thống');
      }

      // Hash password cho admin
      const hashedPassword = await bcrypt.hash(dto.password, 10);

      const admin = await AdminUser.create({
        fullName: dto.fullName,
        email: dto.email,
        password: hashedPassword,
        status: 'active',
      });

      const token = generateToken({
        id: admin.id,
        email: admin.email,
        fullName: admin.fullName,
        role: 'admin',
      });

      // Ẩn password khi trả về
      const adminPlain = admin.get({ plain: true }) as any;
      delete adminPlain.password;

      return ResponseUtil.created(
        res,
        { token, user: adminPlain },
        'Admin registered successfully',
      );
    } catch (error: any) {
      console.error('Register error:', error);
      return ResponseUtil.error(res, error.message || 'Register failed');
    }
  }

  // ============================
  // LOGIN: admin (email+password) / user (userid+password)
  // ============================
  async login(req: Request, res: Response) {
    try {
      const { email, userid, password } = req.body as {
        email?: string;
        userid?: string;
        password?: string;
      };

      // Không validate strict nữa – chỉ check cơ bản
      if (!email && !userid) {
        return ResponseUtil.badRequest(
          res,
          'Vui lòng nhập email (admin) hoặc userid (user)',
        );
      }

      if (!password) {
        return ResponseUtil.badRequest(res, 'Vui lòng nhập password');
      }

      // ========== 1. ADMIN LOGIN (email) ==========
      if (email) {
        const admin = await AdminUser.findOne({ where: { email } });

        if (!admin) {
          return ResponseUtil.unauthorized(res, 'Sai email hoặc mật khẩu');
        }

        if (admin.status !== 'active') {
          return ResponseUtil.forbidden(res, 'Tài khoản admin đang không hoạt động');
        }

        // Nếu DB đang lưu HASH:
        const isCorrect = await bcrypt.compare(password, admin.password);
        // Nếu hiện tại bạn lưu plain-text:
        // const isCorrect = password === admin.password;

        if (!isCorrect) {
          return ResponseUtil.unauthorized(res, 'Sai email hoặc mật khẩu');
        }

        const token = generateToken({
          id: admin.id,
          email: admin.email,
          fullName: admin.fullName,
          role: 'admin',
        });

        const adminPlain = admin.get({ plain: true }) as any;
        delete adminPlain.password;

        return ResponseUtil.success(
          res,
          {
            token,
            user: {
              ...adminPlain,
              role: 'admin',
            },
          },
          'Admin login thành công',
        );
      }

      // ========== 2. USER LOGIN (userid) ==========
      if (userid) {
        const user = await User.findOne({
          where: {
            userid,          // chỉ cần userid
            // không filter deletedYn ở đây để tránh trường hợp null
          },
        });

        // Không tìm thấy hoặc đã bị đánh dấu xoá mềm -> không cho login
        if (!user || user.deletedYn === true) {
          return ResponseUtil.unauthorized(res, 'Sai userid hoặc mật khẩu');
        }

        // ❗️BẢNG users ĐANG LƯU MẬT KHẨU DẠNG PLAIN TEXT
        //  -> So sánh trực tiếp, KHÔNG dùng bcrypt
        const isCorrect = password === user.password;

        if (!isCorrect) {
          return ResponseUtil.unauthorized(res, 'Sai userid hoặc mật khẩu');
        }

        const token = generateToken({
          id: user.id,
          email: user.email ?? undefined,
          fullName: user.name ?? undefined,
          role: 'user',
          userid: user.userid,
        });

        const userPlain = user.get({ plain: true }) as any;
        delete userPlain.password;

        return ResponseUtil.success(
          res,
          {
            token,
            user: {
              ...userPlain,
              role: 'user',
            },
          },
          'User login thành công',
        );
      }

      // Về lý thuyết sẽ không vào đây
      return ResponseUtil.badRequest(res, 'Dữ liệu không hợp lệ');
    } catch (error: any) {
      console.error('Login error:', error);
      return ResponseUtil.error(res, error.message || 'Login failed');
    }
  }

  // ============================
  // GET PROFILE: lấy theo role trong JWT
  // ============================
  async getProfile(req: Request, res: Response) {
    try {
      const authUser = req.user; // JwtPayload từ auth.middleware

      if (!authUser) {
        return ResponseUtil.unauthorized(res, 'Unauthorized');
      }

      if (authUser.role === 'admin') {
        const admin = await AdminUser.findByPk(authUser.id, {
          attributes: { exclude: ['password'] },
        });

        if (!admin) {
          return ResponseUtil.notFound(res, 'Admin not found');
        }

        return ResponseUtil.success(res, admin, 'Profile retrieved successfully');
      }

      // user thường
      const user = await User.findByPk(authUser.id, {
        attributes: { exclude: ['password'] },
      });

      if (!user || user.deletedYn) {
        return ResponseUtil.notFound(res, 'User not found');
      }

      return ResponseUtil.success(res, user, 'Profile retrieved successfully');
    } catch (error: any) {
      console.error('Get profile error:', error);
      return ResponseUtil.error(res, error.message || 'Get profile failed');
    }
  }

  // ============================
  // UPDATE PROFILE: theo role
  // route: PUT /auth/profile/:id (đã có optionalAuthMiddleware)
  // ============================
  async updateProfile(req: Request, res: Response) {
    try {
      const authUser = req.user; // có thể undefined nếu không gửi token

      if (!authUser) {
        // tuỳ bạn, ở đây mình yêu cầu phải đăng nhập
        return ResponseUtil.unauthorized(res, 'Vui lòng đăng nhập để cập nhật profile');
      }

      const dto = plainToClass(UpdateProfileDto, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        return ResponseUtil.badRequest(res, 'Validation failed', errors);
      }

      // Bạn có thể dùng param :id để check người dùng có đang sửa đúng account của mình hay không
      const paramId = Number(req.params.id);
      if (!Number.isNaN(paramId) && authUser.role !== 'admin' && authUser.id !== paramId) {
        return ResponseUtil.forbidden(res, 'Bạn không có quyền chỉnh sửa profile của người khác');
      }

      // Ưu tiên: update theo id trong token
      const idToUpdate = authUser.id;

      if (authUser.role === 'admin') {
        const admin = await AdminUser.findByPk(idToUpdate);

        if (!admin) {
          return ResponseUtil.notFound(res, 'Admin not found');
        }

        // Map field từ DTO
        if (dto.fullName !== undefined) admin.fullName = dto.fullName;
        if (dto.email !== undefined) admin.email = dto.email;
        if ((dto as any).phone !== undefined) admin.phoneNumber = (dto as any).phone;

        await admin.save();

        const adminSafe = await AdminUser.findByPk(idToUpdate, {
          attributes: { exclude: ['password'] },
        });

        return ResponseUtil.updated(res, adminSafe, 'Profile updated successfully');
      }

      // user thường
      const user = await User.findByPk(idToUpdate);

      if (!user || user.deletedYn) {
        return ResponseUtil.notFound(res, 'User not found');
      }

      // Ở DTO là fullName, trong DB là "name" -> map lại
      if (dto.fullName !== undefined) user.name = dto.fullName;
      if (dto.email !== undefined) user.email = dto.email;

      await user.save();

      const userSafe = await User.findByPk(idToUpdate, {
        attributes: { exclude: ['password'] },
      });

      return ResponseUtil.updated(res, userSafe, 'Profile updated successfully');
    } catch (error: any) {
      console.error('Update profile error:', error);
      return ResponseUtil.error(res, error.message || 'Update profile failed');
    }
  }
}
  
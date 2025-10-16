import { Response } from 'express';

/**
 * Response Utility Class
 * Cung cấp các methods để trả response chuẩn cho tất cả API
 */
export class ResponseUtil {
  /**
   * Success response
   * @param res - Express Response object
   * @param data - Data cần trả về
   * @param message - Thông báo
   * @param statusCode - HTTP status code (default: 200)
   */
  static success(res: Response, data: any, message: string = 'Success', statusCode: number = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  /**
   * Error response
   * @param res - Express Response object
   * @param message - Error message
   * @param statusCode - HTTP status code (default: 500)
   * @param errors - Chi tiết lỗi (optional)
   */
  static error(res: Response, message: string = 'Error', statusCode: number = 500, errors?: any) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors
    });
  }

  /**
   * Created response (201)
   * Dùng khi tạo mới resource thành công
   */
  static created(res: Response, data: any, message: string = 'Created successfully') {
    return this.success(res, data, message, 201);
  }

  /**
   * Updated response (200)
   * Dùng khi cập nhật resource thành công
   */
  static updated(res: Response, data: any, message: string = 'Updated successfully') {
    return this.success(res, data, message, 200);
  }

  /**
   * Deleted response (200)
   * Dùng khi xóa resource thành công
   */
  static deleted(res: Response, message: string = 'Deleted successfully') {
    return this.success(res, null, message, 200);
  }

  /**
   * Not Found response (404)
   * Dùng khi không tìm thấy resource
   */
  static notFound(res: Response, message: string = 'Resource not found') {
    return this.error(res, message, 404);
  }

  /**
   * Bad Request response (400)
   * Dùng khi request không hợp lệ
   */
  static badRequest(res: Response, message: string = 'Bad request', errors?: any) {
    return this.error(res, message, 400, errors);
  }

  /**
   * Unauthorized response (401)
   * Dùng khi chưa đăng nhập hoặc token không hợp lệ
   */
  static unauthorized(res: Response, message: string = 'Unauthorized') {
    return this.error(res, message, 401);
  }

  /**
   * Forbidden response (403)
   * Dùng khi không có quyền truy cập
   */
  static forbidden(res: Response, message: string = 'Forbidden') {
    return this.error(res, message, 403);
  }

  /**
   * Internal Server Error response (500)
   * Dùng khi có lỗi server
   */
  static serverError(res: Response, message: string = 'Internal server error', error?: any) {
    return this.error(res, message, 500, error);
  }
}
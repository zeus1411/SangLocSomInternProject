import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, IsArray, ValidateNested,IsInt,Min} from 'class-validator';
import { Type } from 'class-transformer';
  
  /**
   * DTO cho mỗi câu trả lời (FormInstanceValue)
   */
  export class FormInstanceValueDto {
    @IsNumber()
    @IsNotEmpty({ message: 'Dataset member ID is required' })
    datasetmemberid!: number;
  
    @IsNumber()
    @IsNotEmpty({ message: 'Data element ID is required' })
    dataelementid!: number;
  
    @IsString()
    @IsNotEmpty({ message: 'Value is required' })
    value!: string;  // VD: "Y" hoặc "N"
  }
  
  /**
   * DTO để tạo FormInstance mới
   * Khi POST /api/forminstances
   */
  export class CreateFormInstanceDto {
    // Thông tin về trẻ
    @IsNumber()
    @IsOptional()
    personid?: number;
  
    @IsString()
    @IsNotEmpty({ message: 'Child name is required' })
    name!: string;
  
    @IsString()
    @IsOptional()
    birthday?: string;  // Format: "YYYY-MM-DD"
  
    @IsString()
    @IsOptional()
    address?: string;
  
    @IsNumber()
    @IsInt()
    @Min(0)
    @IsOptional()
    months?: number;  // Số tháng tuổi
  
    @IsBoolean()
    @IsOptional()
    gender?: boolean;  // true = Nam, false = Nữ
  
    // Thông tin phụ huynh
    @IsString()
    @IsOptional()
    parentname?: string;
  
    @IsString()
    @IsOptional()
    phone?: string;
  
    // Thông tin khám
    @IsNumber()
    @IsNotEmpty({ message: 'Form ID is required' })
    formid!: number;
  
    @IsString()
    @IsOptional()
    description?: string;
  
    @IsString()
    @IsOptional()
    surveyby?: string;  // Người thực hiện sàng lọc
  
    @IsString()
    @IsOptional()
    surveyplace?: string;  // Nơi thực hiện
  
    // Liên kết Period và OrgUnit
    @IsNumber()
    @IsOptional()
    periodid?: number;
  
    @IsNumber()
    @IsOptional()
    orgunitid?: number;
  
    @IsNumber()
    @IsOptional()
    provinceid?: number;
  
    @IsNumber()
    @IsOptional()
    districtid?: number;
  
    // Danh sách câu trả lời
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FormInstanceValueDto)
    @IsOptional()
    values?: FormInstanceValueDto[];
  }
  
  /**
   * DTO để cập nhật FormInstance
   * Khi PUT /api/forminstances/:id
   * Tất cả fields đều optional vì có thể chỉ update 1 phần
   */
  export class UpdateFormInstanceDto {
    @IsNumber()
    @IsOptional()
    personid?: number;
  
    @IsString()
    @IsOptional()
    name?: string;
  
    @IsString()
    @IsOptional()
    birthday?: string;
  
    @IsString()
    @IsOptional()
    address?: string;
  
    @IsNumber()
    @IsInt()
    @Min(0)
    @IsOptional()
    months?: number;
  
    @IsNumber()
    @IsOptional()
    formid?: number;
  
    @IsString()
    @IsOptional()
    description?: string;
  
    @IsBoolean()
    @IsOptional()
    ispasses?: boolean;  // Kết quả sàng lọc: Pass/Fail
  
    @IsBoolean()
    @IsOptional()
    gender?: boolean;
  
    @IsString()
    @IsOptional()
    parentname?: string;
  
    @IsString()
    @IsOptional()
    phone?: string;
  
    @IsString()
    @IsOptional()
    surveyby?: string;
  
    @IsString()
    @IsOptional()
    surveyplace?: string;
  
    @IsNumber()
    @IsOptional()
    periodid?: number;
  
    @IsNumber()
    @IsOptional()
    orgunitid?: number;
  
    @IsNumber()
    @IsOptional()
    provinceid?: number;
  
    @IsNumber()
    @IsOptional()
    districtid?: number;
  
    // Cập nhật lại câu trả lời (sẽ xóa cũ và tạo mới)
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FormInstanceValueDto)
    @IsOptional()
    values?: FormInstanceValueDto[];
  }
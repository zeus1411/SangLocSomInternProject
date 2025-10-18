import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Program {
  id: number;
  code: string;
  name: string;
  note?: string;
  forms?: Form[];
}

export interface Form {
  id: number;
  code?: string;
  name?: string;
  programid?: number;
  filterfrom?: string;
  filterto?: string;
  explain?: string;
}

export interface FormInstance {
  id: number;
  name?: string;
  birthday?: string;
  address?: string;
  months?: number;
  description?: string;
  ispasses?: boolean;
  gender?: boolean;
  parentname?: string;
  phone?: string;
  surveyby?: string;
  surveyplace?: string;
  periodid?: number;
  orgunitid?: number;
  provinceid?: number;
  districtid?: number;
  personid?: number;
  formid?: number;
  createdDate?: Date;
  createdBy?: string;
  updatedDate?: Date;
  updatedBy?: string;
  surveyNote?: string;
}

export interface Period {
  id: number;
  code?: string;
  name?: string;
  note?: string;
  fromdate?: Date;
  todate?: Date;
  isactive?: boolean;
  createddate?: Date;
  createdby?: string;
  updateddate?: Date;
  updatedby?: string;
}

export interface OrgUnit {
  id: number;
  code?: string;
  name?: string;
  parentid?: number;
  level?: number;
}

export interface DataElement {
  id: number;
  code?: string;
  name?: string;
  itemlist?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Program APIs
  getProgramByCode(code: string): Observable<any> {
    return this.http.get(`${environment.url}/api/programs/bycode/${code}`);
  }

  getPrograms(): Observable<any> {
    return this.http.get(`${environment.url}/api/programs`);
  }

  // Form APIs
  getFormById(id: number): Observable<any> {
    return this.http.get(`${environment.url}/api/forms/${id}`);
  }

  getFormStructure(id: number): Observable<any> {
    return this.http.get(`${environment.url}/api/forms/${id}`);
  }

  // Form Instance APIs
  getFormInstance(id: number): Observable<any> {
    return this.http.get(`${environment.url}/api/forminstances/${id}`);
  }

  getFormInstanceValues(formInstanceId: number): Observable<any> {
    return this.http.get(`${environment.url}/api/forminstances/${formInstanceId}/value?pageSize=1000`);
  }

  createFormInstance(data: any): Observable<any> {
    return this.http.post(`${environment.url}/api/forminstances`, data, {
      headers: this.getAuthHeaders()
    });
  }

  updateFormInstance(id: number, data: any): Observable<any> {
    return this.http.put(`${environment.url}/api/forminstances/${id}`, data, {
      headers: this.getAuthHeaders()
    });
  }

  getFormInstances(filters?: any): Observable<any> {
    let params = '';
    if (filters) {
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined) {
          queryParams.append(key, filters[key].toString());
        }
      });
      params = '?' + queryParams.toString();
    }
    return this.http.get(`${environment.url}/api/forminstances${params}`);
  }

  // Period APIs
  getCurrentPeriod(): Observable<any> {
    return this.http.get(`${environment.url}/api/periods/current?pageSize=20&page=1`);
  }

  getPeriods(): Observable<any> {
    return this.http.get(`${environment.url}/api/periods`);
  }

  getActivePeriod(): Observable<any> {
    return this.http.get(`${environment.url}/api/periods/active`);
  }

  // OrgUnit APIs
  getOrgUnits(parentId?: number): Observable<any> {
    let url = `${environment.url}/api/orgunits?pageSize=10000&page=1`;
    if (parentId) {
      url += `&parentid=${parentId}`;
    }
    return this.http.get(url);
  }

  getOrgUnitTree(): Observable<any> {
    return this.http.get(`${environment.url}/api/orgunits/tree`);
  }

  // DataElement APIs
  getDataElements(): Observable<any> {
    return this.http.get(`${environment.url}/api/dataelements`);
  }

  // Dataset APIs
  getDatasets(): Observable<any> {
    return this.http.get(`${environment.url}/api/datasets`);
  }

  getDatasetWithMembers(id: number): Observable<any> {
    return this.http.get(`${environment.url}/api/datasets/${id}/members`);
  }
}

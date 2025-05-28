import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map} from "rxjs";
import {IRegisterInfoGoogleSheet} from "../models/interfaces";

const SHEET_ID = '1yBdk3nou_ReZQNkARxrJqbqlJEQWSbuvbUGT0KTG-QQ';
const SHEET_NAME = 'Ответы на форму (1)';

@Injectable({
  providedIn: 'root'
})
export class GoogleTableService {

  constructor(private http: HttpClient) {}

  getSheetData() {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;

    return this.http.get(url, { responseType: 'text' }).pipe(
      map(response => this.parseGoogleData(response))
    );
  }

  private parseGoogleData(response: string): IRegisterInfoGoogleSheet[] {
    // Удаление префикса безопасности
    const jsonStr = response.match(/.*?({.*})/)?.[1] || '{}';

    try {
      const json = JSON.parse(jsonStr);
      return json.table.rows.map((row: any) => {
        return row.c.reduce((obj: any, cell: any, index: number) => {
          obj[json.table.cols[index].label] = cell?.v || null;
          return obj;
        }, {});
      });
    } catch (e) {
      console.error('Ошибка парсинга', e);
      return [];
    }
  }
}

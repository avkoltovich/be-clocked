import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class GoogleTableService {

  constructor(private http: HttpClient) {}

  public extractGoogleSheetId(url: string) {
    // Регулярное выражение для поиска ID
    const regex = /\/d\/([a-zA-Z0-9-_]+)/;

    // Ищем совпадение в строке
    const match = url.match(regex);

    // Если найдено совпадение, возвращаем первую группу (ID)
    return match ? match[1] : null;
  }

  public getSheetData(sheetId: string) {
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;

    return this.http.get(url, { responseType: 'text' }).pipe(
      map(response => this.parseGoogleData(response))
    );
  }

  private parseGoogleData(response: string): Record<string, any>[] {
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

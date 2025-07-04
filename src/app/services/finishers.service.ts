import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {IFinishCategory, IFinisher} from "../models/interfaces";
import {RepositoryService} from "./repository.service";

@Injectable({
  providedIn: 'root'
})
export class FinishersService {
  public finishers$ = new BehaviorSubject<IFinisher[]>([]);
  public finisherNameList: string[] = [];
  public anonFinishers$ = new BehaviorSubject<IFinisher[]>([]);
  public finishersByCategories$ = new BehaviorSubject<IFinishCategory[]>([]);
  public currentAnonIndex$ = new BehaviorSubject(0);

  constructor(private repositoryService: RepositoryService) {
    this.initFinishersData();
  }

  public initFinishersData() {
    const finishers = this.repositoryService.readFinishers();
    const finisherNameList = this.repositoryService.readFinisherNameList();
    const anonFinishers = this.repositoryService.readAnons();
    const anonIndex = this.repositoryService.readCurrentAnonIndex();
    const finishersByCategories = this.repositoryService.readFinishersByCategories();

    if (finishers !== null) this.finishers$.next(finishers);
    if (finisherNameList !== null) this.finisherNameList = finisherNameList;
    if (anonFinishers !== null) this.anonFinishers$.next(anonFinishers);
    if (anonIndex !== null) this.currentAnonIndex$.next(anonIndex);
    if (finishersByCategories !== null) this.finishersByCategories$.next(finishersByCategories);
  }

  public resetFinishersData() {
    this.finishers$.next([]);
    this.finisherNameList = [];
    this.anonFinishers$.next([]);
    this.finishersByCategories$.next([]);
    this.currentAnonIndex$.next(0);
  }

  public updateFinishers(finishers: IFinisher[]) {
    this.finishers$.next(finishers);
    this.repositoryService.updateFinishers(finishers);
  }

  public updateFinisherNameList(finisherNameList: string[]) {
    this.finisherNameList = finisherNameList;
    this.repositoryService.updateFinisherNameList(finisherNameList);
  }

  public updateFinishersByCategories(finishersByCategory: IFinishCategory[]) {
    this.finishersByCategories$.next(finishersByCategory);
    this.repositoryService.updateFinishersByCategories(finishersByCategory);
  }

  public updateAnonData(data: IFinisher[], index: number = this.currentAnonIndex$.value) {
    this.anonFinishers$.next(data);
    this.currentAnonIndex$.next(index);

    this.repositoryService.updateAnons(data);
    this.repositoryService.updateCurrentAnonIndex(index);
  }
}

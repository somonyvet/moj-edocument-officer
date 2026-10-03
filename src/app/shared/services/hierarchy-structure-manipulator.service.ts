import { Injectable } from '@angular/core';
import * as _ from 'lodash';

export interface IGroupBy {
  data: Array<any>;
  parentData: any;
}

export class IHierarchyNode {
  name: string;
  cssClass: string = 'ngx-org-ceo';
  image: string = 'assets/images/avatars/profile.png';
  title: string;
  childs: Array<any>;
  originalData: any;
  childrenData: any;
}

@Injectable({
  providedIn: 'root'
})
export class HierarchyStructureManipulatorService {

  constructor() { }

  getNode(arrNodes: Array<any>) {
    if (!arrNodes) return;
    let nodes = [];

    let tempResult: Array<IHierarchyNode> = [];
    const bindedData: Array<IGroupBy> = groupByData(arrNodes, 'parentData', 'subOfDepartment.key') as Array<IGroupBy>;

    if (bindedData.length === 0) {
      nodes = [{
        name: 'អគ្គនាយកដ្ឋានអន្តោប្រវេសន៍',
        cssClass: 'ngx-org-ceo',
        image: null,
        title: null,
        childs: [],

        originalData: null,
        childrenData: null,
      }];

      return;
    }

    const rootIndex = bindedData.findIndex((item) => item.parentData === undefined);

    bindedData.forEach((item: IGroupBy, index) => {
      if (!item.parentData) return;

      const bindedChildrenData = item.data.map((jtem, jndex) => {
        return {
          name: jtem?.name,
          cssClass: 'ngx-org-ceo',
          image: null,
          // title: jtem?.company?.name || null,
          title: jtem?.headerOfficer && jtem?.headerOfficer?.length > 0 ? `${jtem?.headerOfficer[0]?.last_name} ${jtem?.headerOfficer[0]?.first_name} (${jtem?.headerOfficer[0]?.officerId})` : null,
          childs: [],

          originalData: jtem,
          childrenData: [],
        }
      });

      tempResult.push({
        name: item?.parentData?.name,
        cssClass: 'ngx-org-ceo',
        image: null,
        // title: item?.parentData?.company?.name || null,
        title: item?.parentData?.headerOfficer && item?.parentData?.headerOfficer?.length > 0 ? `${item?.parentData?.headerOfficer[0]?.last_name} ${item?.parentData?.headerOfficer[0]?.first_name} (${item?.parentData?.headerOfficer[0]?.officerId})` : null,
        childs: bindedChildrenData || [],

        originalData: item.parentData,
        childrenData: item.data,
      });
    });

    tempResult.sort(function compare(a, b) {
      if (a.originalData?.level > b.originalData?.level) return -1;
      if (a.originalData?.level < b.originalData?.level) return 1;
      return 0;
    });

    tempResult.map((rootItem, rootIndex) => {
      rootItem.childs.forEach((item, index) => {
        const foundIndex = tempResult.findIndex((jtem, jndex) => item.name === jtem.name && item.title === jtem.title);
        if (foundIndex >= 0) {
          const immigratedData = tempResult[foundIndex];
          rootItem.childs[index].childs = immigratedData.childs;
        }
      });

      return rootItem;
    });

    tempResult[tempResult.length - 1] = {
      name: bindedData[rootIndex]?.data[0].name,
      cssClass: 'ngx-org-ceo',
      image: null,
      // title: bindedData[rootIndex]?.data[0].company?.name,
      title: bindedData[rootIndex]?.data[0]?.headerOfficer && bindedData[rootIndex]?.data[0]?.headerOfficer?.length > 0 ? `${bindedData[rootIndex]?.data[0]?.headerOfficer[0]?.last_name} ${bindedData[rootIndex]?.data[0]?.headerOfficer[0]?.first_name} (${bindedData[rootIndex]?.data[0]?.headerOfficer[0]?.officerId})` : null,
      childs: tempResult[tempResult.length - 1].childs,

      originalData: { ...bindedData[rootIndex]?.parentData, level: -2 },
      childrenData: tempResult[tempResult.length - 1].childrenData,
    };

    nodes = [tempResult[tempResult.length - 1]];
    return nodes;
  }

}

export function groupByData(data: Array<any>, field: string, fields?: string[] | string) {
  const rows = _.chain(data).groupBy(fields ? fields : field).map((value, key) => {
    const index = data.findIndex((item) => item.key === key);
    return { [field]: data[index], data: value };
  }).value()
  return rows
}

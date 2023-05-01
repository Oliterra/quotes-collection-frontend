import {Component, Input, OnChanges, OnInit, Output} from '@angular/core';
import {Subject} from "rxjs";
import {AbstractControl, FormControl} from "@angular/forms";

export interface ItemInfo {
  item: any,
  isSelected: boolean;
}

@Component({
  selector: 'app-input-dropdown',
  templateUrl: './input-dropdown.component.html',
  styleUrls: ['./input-dropdown.component.scss']
})
export class InputDropdownComponent implements OnInit, OnChanges {

  public readonly NAME_FIELD: string = 'name';
  private readonly LI_HEIGHT: number = 29;
  private readonly MULTISELECT_DELIMITER: string = ', ';

  @Input()
  public control: AbstractControl;
  @Input()
  public items: any[];
  @Input()
  public isMultiselect: boolean = false;
  @Input()
  public isReadonly: boolean = false;
  @Input()
  public showSelectedItemsSeparately: boolean = false;
  @Input()
  public isFirstCharacterSpecial: boolean = false;
  @Input()
  public maxItemsCount: number = 3;
  @Input()
  public clean: Subject<any>[] = [];
  @Input()
  public showAddButton: boolean = false;

  @Output()
  public onItemSelection: Subject<any> = new Subject<any>();
  @Output()
  public onItemUnselection: Subject<any> = new Subject<any>();
  @Output()
  public onItemAdding: Subject<void> = new Subject<void>();

  public itemInfos: ItemInfo[];
  public isOpen: boolean = false;
  public selectedItemsToShowSeparately: ItemInfo[] = [];

  public ngOnInit(): void {
    this.clean.forEach((subject: Subject<any>) => {
      subject.subscribe(() => {
        this.selectedItemsToShowSeparately = [];
        this.itemInfos.forEach((itemInfo: ItemInfo) => itemInfo.isSelected = false);
        this.closeFilteredItemsDropdown();
      });
    });
  }

  public ngOnChanges(): void {
    if (this.items?.length && !this.itemInfos?.length) {
      this.updateItemsSelection();
      this.itemInfos.filter((itemInfo: ItemInfo) => itemInfo.isSelected).forEach((itemInfo: any) => this.onItemSelection.next(itemInfo.item));
    }
  }

  public onInput(): void {
    const selectedItem: any = this.items.find((item: any) => item[this.NAME_FIELD] === this.formControl.value);
    if (selectedItem) {
      this.onItemSelection.next(this.items.find((item: any) => item[this.NAME_FIELD] === this.formControl.value));
    } else {
      this.onItemUnselection.next(null);
    }
    this.openFilteredItemsDropdown();
    this.updateItemsSelection();
  }

  public onClick(itemInfo: ItemInfo): void {
    if (this.isMultiselect) {
      this.openFilteredItemsDropdown();
      if (itemInfo.isSelected) {
        this.onMultiselectItemUnselection(itemInfo);
      } else {
        this.onMultiselectItemSelection(itemInfo);
      }
    } else {
      this.onItemSelection.next(itemInfo.item);
      this.formControl.setValue(this.getItemName(itemInfo));
    }
    this.updateItemsSelection();
  }

  public get formControl(): FormControl {
    return this.control as FormControl
  }

  public get filteredItemInfos(): ItemInfo[] {
    if (!this.isReadonly && this.formControl.value) {
      return this.itemInfos.filter((itemInfo: any) =>
        (this.isFirstCharacterSpecial ? String(this.getItemName(itemInfo)).substring(1) : String(this.getItemName(itemInfo)))
          .startsWith(this.formControl.value) && this.getItemName(itemInfo) !== this.formControl.value);
    } else {
      return this.itemInfos;
    }
  }

  public getDropdownHeight(): string {
    let itemsCount: number = this.filteredItemInfos.length < this.maxItemsCount ? this.filteredItemInfos.length : this.maxItemsCount;
    if (this.showAddButton && itemsCount < this.maxItemsCount) {
      itemsCount += 1;
    }
    return this.LI_HEIGHT * itemsCount + 'px';
  }

  public getItemName(itemInfo: ItemInfo): string {
    return itemInfo.item[this.NAME_FIELD];
  }

  public openFilteredItemsDropdown(): void {
    this.isOpen = true;
  }

  public closeFilteredItemsDropdown(): void {
    this.isOpen = false;
  }

  private updateItemsSelection(): void {
    let selectedItems: string[] = [];
    if (this.formControl.value) {
      selectedItems = this.formControl.value.toString().split(this.MULTISELECT_DELIMITER);
    }
    this.itemInfos = this.items.map((item: any) => ({
      item: item,
      isSelected: selectedItems.includes(item[this.NAME_FIELD])
    }));
  }

  private onMultiselectItemSelection(itemInfo: ItemInfo): void {
    itemInfo.isSelected = true;
    this.onItemSelection.next(itemInfo.item);
    if (this.showSelectedItemsSeparately) {
      this.selectedItemsToShowSeparately.push(itemInfo);
      this.formControl.reset();
    } else {
      let selectedItemNames: string = this.formControl.value;
      if (this.formControl.value?.length) {
        selectedItemNames = selectedItemNames + this.MULTISELECT_DELIMITER;
      }
      selectedItemNames = selectedItemNames + this.getItemName(itemInfo);
      this.formControl.setValue(selectedItemNames);
    }
  }

  public onMultiselectItemUnselection(itemInfo: ItemInfo): void {
    itemInfo.isSelected = false;
    this.onItemUnselection.next(itemInfo.item);
    if (this.showSelectedItemsSeparately) {
      this.selectedItemsToShowSeparately = this.selectedItemsToShowSeparately.filter((selectedItemInfo: ItemInfo) => selectedItemInfo !== itemInfo);
    } else {
      let selectedItemNames: string = this.formControl.value;
      const itemName: string = this.getItemName(itemInfo);
      const startIndex: number = selectedItemNames.indexOf(itemName);
      const endIndex: number = startIndex + itemName.length;
      let itemNameToRemove: string = itemName;
      if (endIndex !== selectedItemNames.length) {
        itemNameToRemove = itemNameToRemove + this.MULTISELECT_DELIMITER;
      }
      if (startIndex !== 0 && endIndex === selectedItemNames.length) {
        itemNameToRemove = this.MULTISELECT_DELIMITER + itemNameToRemove;
      }
      this.formControl.setValue(selectedItemNames.replace(itemNameToRemove, ''));
    }
  }
}

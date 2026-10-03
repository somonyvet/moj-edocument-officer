import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { MasterFormRoutingModule } from './master-form-routing.module';
import { StockAdjustmentFormItemsComponent } from './pages/stock-adjustment-form-items/stock-adjustment-form-items.component';
import { StockAdjustmentFormComponent } from './pages/stock-adjustment-form/stock-adjustment-form.component';
import { StockTransferFormComponent } from './pages/stock-transfer-form/stock-transfer-form.component';

@NgModule({
  declarations: [
    StockTransferFormComponent,
    StockAdjustmentFormComponent,
    StockAdjustmentFormItemsComponent
  ],

  imports: [
    CommonModule,
    MasterFormRoutingModule,
    SharedModule,
  ],
  providers: []
})
export class MasterFormModule { }

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StockAdjustmentFormComponent } from './pages/stock-adjustment-form/stock-adjustment-form.component';
import { StockTransferFormComponent } from './pages/stock-transfer-form/stock-transfer-form.component';

const routes: Routes = [
    { path: "inventory/stock-adjustment-form/:id", component: StockAdjustmentFormComponent },
    { path: "inventory/stock-transfer-form/:id", component: StockTransferFormComponent },

    // { path: 'inventory/transfer-stock-in/:id', component: TransferStockInFormComponent },
    // { path: 'inventory/receive-stock/:id', component: ReceiveStockFormComponent },
    // { path: 'inventory/inventory-adjustment/:id', component: InventoryAdjustmentFormComponent },
    // { path: 'inventory/inventory-transfer/:id', component: InventoryTransferFormComponent },
    // { path: 'purchase/enter-bill/:id', component: EnterBillComponent },
    // { path: 'journal-entry/:id', component: JournalEntryFormComponent },
    // { path: 'petty-cash/:id', component: AccountPettyCashFormComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MasterFormRoutingModule { }

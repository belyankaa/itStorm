import {Component, ElementRef, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {OrderService} from "../../services/order.service";
import {FormBuilder, Validators} from "@angular/forms";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {Router} from "@angular/router";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  //Попап консультации
  public popupProcced: boolean = false;
  public popupProccedError: boolean = false;

  dialogRef: MatDialogRef<any> | null = null;


  //Форма попапа консультации
  public consultForm = this.fb.group({
    name: ['', Validators.required],
    phone: ['', Validators.required]
  })

  @ViewChild('popup') popup!: TemplateRef<ElementRef>;

  constructor(private orderService: OrderService,
              private fb: FormBuilder,
              private dialog: MatDialog,
              public router: Router) {
  }

  ngOnInit() {

  }

  public makeAnOrder(): void {
    if (this.consultForm.value.name && this.consultForm.value.phone) {
      this.popupProccedError = false;
      this.orderService.makeAnOrder(this.consultForm.value.name, this.consultForm.value.phone, null, 'consultation')
        .subscribe({
          next: data => {
            if (data.error) {
              throw new Error()
            }
            this.popupProcced = true;
            this.consultForm.reset();
          },
          error: () => {
            this.popupProccedError = true;
          }
        })
    } else {
      this.popupProccedError = true;
    }
  }

  public openPopup() {
    this.dialogRef = this.dialog.open(this.popup);
    this.dialogRef.backdropClick()
  }

  public closePopup(): void {
    this.dialog.closeAll();
    this.popupProcced = false;
    this.popupProccedError = false;
    this.consultForm.reset();
  }
}

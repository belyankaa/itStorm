import {Component, ElementRef, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {OfferType} from "../../../types/offer.type";
import {OwlOptions} from "ngx-owl-carousel-o";
import {ArticleService} from "../../shared/services/article.service";
import {DefaultResponseType} from "../../../types/default-response.type";
import {ArticleType} from "../../../types/article.type";
import {HttpErrorResponse} from "@angular/common/http";
import {FormBuilder, Validators} from "@angular/forms";
import {OrderService} from "../../shared/services/order.service";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {


  //Карточки 1 блока
  public offers: OfferType[] = [
    {
      type: 'Предложение месяца',
      title: 'Продвижение в Instagram для вашего бизнеса',
      titleColorLast: '-15%',
      znak: '!',
      image: 'main-offer-1.png',
      serviceType: 'Продвижение'
    },
    {
      type: 'Акция',
      title: 'Нужен грамотный',
      titleColorLast: 'копирайтер',
      znak: '?',
      text: 'Весь декабрь у нас действует акция на работу копирайтера.',
      image: 'main-offer-2.png',
      serviceType: 'Копирайтинг'
    },
    {
      type: 'Новость дня',
      title: 'в ТОП-10 SMM-агенств Москвы',
      titleColorStart: '6 место',
      znak: '!',
      text: 'Мы благодарим каждого, кто голосовал за нас!',
      image: 'main-offer-3.png',
      serviceType: 'Продвижение'
    },
  ];
  //Настройки карусели 1 блока
  public customOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    dots: true,
    navSpeed: 700,
    autoWidth: true,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1
      },
      1300: {
        items: 2
      },
      2600: {
        items: 3
      }
    },
    nav: false,
  };
  //Настройки карусели отзывов
  public customOptions2: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    margin: 25,
    dots: false,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 2
      },
      740: {
        items: 3
      }
    },
    nav: false
  };
  //Карточки 2 блока
  public services: { image: string, title: string, text: string, price: string }[] = [
    {
      image: 'service1.png',
      title: 'Создание сайтов',
      text: 'В краткие сроки мы создадим качественный и самое главное продающий сайт для продвижения Вашего бизнеса!',
      price: 'От 7500 ₽'
    },
    {
      image: 'service2.png',
      title: 'Продвижение',
      text: 'Вам нужен качественный SMM-специалист или грамотный таргетолог? Мы готовы оказать Вам услугу “Продвижения” на наивысшем уровне!',
      price: 'От 3 500₽'
    },
    {
      image: 'service3.png',
      title: 'Реклама',
      text: 'Без рекламы не может обойтись ни один бизнес или специалист. Обращаясь к нам, мы гарантируем быстрый прирост клиентов за счёт правильно настроенной рекламы.',
      price: 'От 1 000₽'
    },
    {
      image: 'service4.png',
      title: 'Копирайтинг',
      text: 'Наши копирайтеры готовы написать Вам любые продающие текста, которые не только обеспечат рост охватов, но и помогут выйти на новый уровень в продажах.',
      price: 'От 750₽'
    },
  ];
  //Популярные артиклы
  public popularArticles: ArticleType[] = [];
  //Попап услуг
  public popupProcced: boolean = false;

  //Форма попапа услуг
  public serviceForm = this.fb.group({
    service: ['', Validators.required],
    name: ['', Validators.required],
    phone: ['', Validators.required]
  })

  dialogRef: MatDialogRef<any> | null = null;
  @ViewChild('popup') popup!: TemplateRef<ElementRef>;

  constructor(private articleService: ArticleService,
              private fb: FormBuilder,
              private orderService: OrderService,
              private dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.articleService.getPopularArticles()
      .subscribe({
        next: (data: DefaultResponseType | ArticleType[]): void => {
          if ((data as DefaultResponseType).error !== undefined) {
            throw new Error();
          }
          this.popularArticles = data as ArticleType[]
        },
        error: (error: HttpErrorResponse): void => {
          console.log(error)
        }
      })
  }

  public makeAnServiceOrder(): void {
    if (this.serviceForm.value.name && this.serviceForm.value.service && this.serviceForm.value.phone) {
      this.orderService.makeAnOrder(this.serviceForm.value.name, this.serviceForm.value.phone, this.serviceForm.value.service, 'order')
        .subscribe({
          next: data => {
            if (data.error) {
              throw new Error()
            }
            this.popupProcced = true;
            this.serviceForm.reset();
          },
          error: () => {
          }
        })
    }
  }

  public openPopup(value: string): void {
    this.dialogRef = this.dialog.open(this.popup);
    this.serviceForm.get('service')?.setValue(value);
  }

  public closePopup(): void {
    this.dialog.closeAll();
    this.popupProcced = false;
    this.serviceForm.reset();
  }
}

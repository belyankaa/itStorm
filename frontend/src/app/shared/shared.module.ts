import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink, RouterOutlet} from "@angular/router";
import {ArticleCardComponent} from './components/article-card/article-card.component';
import { LoaderComponent } from './components/loader/loader.component';


@NgModule({
  declarations: [
    ArticleCardComponent,
    LoaderComponent,
  ],
    exports: [
        ArticleCardComponent,
        LoaderComponent
    ],
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink
  ]
})
export class SharedModule {
}

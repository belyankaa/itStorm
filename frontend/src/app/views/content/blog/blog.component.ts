import {Component, OnInit} from '@angular/core';
import {ArticleService} from "../../../shared/services/article.service";
import {ArticleType} from "../../../../types/article.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {HttpErrorResponse} from "@angular/common/http";
import {BlogType} from "../../../../types/blog.type";
import {ParamsType} from "../../../../types/params.type";
import {ActivatedRoute, Router} from "@angular/router";
import {ArticleCategoriesType} from "../../../../types/article-categories.type";
import {debounceTime} from "rxjs";

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit {

  public openFilter: boolean = false;
  public categories: ArticleCategoriesType[] = [];
  public activeCategories: string[] = [];
  public activeCategoriesNames: { name: string, url: string }[] = [];

  public articles: ArticleType[] = [];
  public pages: number[] = [];
  public activePage: number = 1;
  public startPages: boolean = true;
  public endPages: boolean = false;

  private params: ParamsType = {
    categories: []
  };

  constructor(private articleService: ArticleService,
              private activatedRoute: ActivatedRoute,
              private router: Router) {
  }

  ngOnInit() {
    this.articleService.getArticleCategories()
      .subscribe({
        next: (data: ArticleCategoriesType[] | DefaultResponseType): void => {
          if ((data as DefaultResponseType).error !== undefined) {
            throw new Error();
          }

          this.categories = data as ArticleCategoriesType[];


        },
        error: (error: HttpErrorResponse): void => {
          console.log(error.error.message)
        }
      })

    this.activatedRoute.queryParams
      .pipe(
        debounceTime(500)
      )
      .subscribe(params => {
        if (params.hasOwnProperty('page')) {
          this.params.page = params['page'];
          this.activePage = parseInt(params['page']);
        }
        if (params.hasOwnProperty('categories')) {
          this.params.categories = Array.isArray(params['categories']) ? params['categories'] : [params['categories']];
        }

        if (this.params.categories.length > 0) {
          this.activeCategoriesNames = [];
          let hasActive = false;
          this.categories.map(item => {
            hasActive = false;
            this.params.categories.forEach(category => {
              if (category === item.url) {
                hasActive = true;
                this.activeCategoriesNames.push({name: item.name, url: item.url})
                return;
              }
            })
            if (hasActive) {
              item.active = true;
            }
          })
        }

        this.articleService.getArticles(this.params)
          .subscribe({
            next: (data: BlogType | DefaultResponseType): void => {
              if ((data as DefaultResponseType).error !== undefined) {
                throw new Error();
              }

              this.articles = (data as BlogType).items;

              const pages: number = (data as BlogType).pages;
              this.pages = [];
              if (pages > 1) {
                for (let i = 0; i < pages; i++) {
                  this.pages.push(i);
                }
              } else {
                this.pages = [0];
              }

              this.endPages = this.pages.length === this.activePage;
              this.startPages = this.activePage === 1;
            },
            error: (error: HttpErrorResponse): void => {
              console.log(error.error.message)
            }
          })


      })
  }

  nextPage() {
    if (this.pages.length > this.activePage) {
      this.activePage += 1;
      this.endPages = this.pages.length === this.activePage;
      this.startPages = false;
      this.params.page = this.activePage;

      this.router.navigate(['/blog'], {
        queryParams: this.params
      });
    }
  }

  prevPage() {
    if (this.activePage !== 1) {
      this.activePage -= 1;
      this.startPages = this.activePage === 1;
      this.endPages = false;
      this.params.page = this.activePage;

      this.router.navigate(['/blog'], {
        queryParams: this.params
      });
    }
  }

  changePage(page: number) {
    this.activePage = page;
    this.startPages = this.activePage === 1;
    this.endPages = this.pages.length === this.activePage;
    this.params.page = this.activePage;

    this.router.navigate(['/blog'], {
      queryParams: this.params
    });
  }

  public toggleFilter(): void {
    this.openFilter = !this.openFilter;
  }

  public deleteParam(paramUrl: string) {
    this.categories.find(item => {
      if (item.url === paramUrl) {
        item.active = false;
      }
    })

    this.pushInCategoryArray();
    this.params.categories = this.activeCategories;

    this.router.navigate(['/blog'], {
      queryParams: this.params
    });
  }

  public changeParam(paramUrl: string): void {

    this.categories.find(item => {
      if (item.url === paramUrl) {
        item.active = !item.active;
      }
    })

    this.pushInCategoryArray();
    this.params.categories = this.activeCategories;


    this.router.navigate(['/blog'], {
      queryParams: this.params
    });
  }

  private pushInCategoryArray() {
    delete this.params.page;
    this.activeCategories = [];
    this.activeCategoriesNames = [];
    this.categories.forEach(item => {
      if (item.active) {
        this.activeCategories.push(item.url);
        this.activeCategoriesNames.push({
          name: item.name,
          url: item.url
        })
      }
    })
  }
}

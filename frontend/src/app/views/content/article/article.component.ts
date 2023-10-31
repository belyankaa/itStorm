import {Component, OnInit} from '@angular/core';
import {ArticleService} from "../../../shared/services/article.service";
import {ActivatedRoute} from "@angular/router";
import {FullArticleType} from "../../../../types/full-article.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {HttpErrorResponse} from "@angular/common/http";
import {AuthService} from "../../../core/auth/auth.service";
import {ArticleType} from "../../../../types/article.type";
import {CommentType} from "../../../../types/comment.type";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ActionType} from "../../../../types/action.type";
import {YourCommentType} from "../../../../types/your-comment.type";

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss']
})
export class ArticleComponent implements OnInit {

  public isLogged: boolean = this.authService.getIsLoggedIn();

  public actionToComment = ActionType;

  public text: string = '';

  public article!: FullArticleType;
  public relatedArticles: ArticleType[] = [];

  public countOfComments: number = 1;
  public countOfCommentsAll: number = 0;
  public offset: number = 0;


  public comments: CommentType = {
    allCount: 0,
    comments: []
  };
  public yourActions: YourCommentType[] = [];

  constructor(private articleService: ArticleService,
              private authService: AuthService,
              private _snackBar: MatSnackBar,
              private activatedRoute: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.activatedRoute.params
      .subscribe(params => {
        let url: string = params['url'];
        if (url) {
          this.getArticle(url);
          this.getRelatedArticles(url);
        }
      })

  }

  private getArticle(url: string): void {
    this.articleService.getArticle(url)
      .subscribe({
        next: (data: FullArticleType | DefaultResponseType): void => {
          if ((data as DefaultResponseType).error !== undefined) {
            throw new Error();
          }

          this.article = data as FullArticleType;
          this.comments = {
            allCount: (data as FullArticleType).commentsCount,
            comments: (data as FullArticleType).comments
          };
          this.countOfComments = (data as FullArticleType).comments.length;
          this.countOfCommentsAll = (data as FullArticleType).commentsCount;
          this.offset = this.countOfComments;

          if (this.isLogged) {
            this.getYourActions();
          }
        },
        error: (error: HttpErrorResponse): void => {
          console.log(error.message)
        }
      })
  }

  private getRelatedArticles(url: string): void {
    this.articleService.getRelatedArticles(url)
      .subscribe({
        next: (data: ArticleType[] | DefaultResponseType): void => {
          if ((data as DefaultResponseType).error !== undefined) {
            throw new Error();
          }

          this.relatedArticles = data as ArticleType[];
        },
        error: (error: HttpErrorResponse): void => {
          console.log(error.message)
        }
      })
  }

  private getYourActions(): void {
    this.articleService.getSelfActions(this.article.id)
      .subscribe({
        next: (data: YourCommentType[] | DefaultResponseType): void => {
          if ((data as DefaultResponseType).error !== undefined) {
            throw new Error();
          }

          this.yourActions = data as YourCommentType[];
          this.compareCommentsWithYourActions();
        },
        error: (error: HttpErrorResponse): void => {
          console.log(error.message)
        }
      })
  }

  public doAnAction(action: ActionType, commentId: string): void {
    if (!this.isLogged) {
      this._snackBar.open('Чтобы оценить комментарий нужно авторизироваться');
      return;
    }

    this.articleService.doActionToComment(action, commentId)
      .subscribe({
        next: (data: DefaultResponseType): void => {
          if (data.error) {
            throw new Error();
          }

          this.getYourActions();
          if (action === ActionType.report) {
            this._snackBar.open('Жалоба отправлена');
            return
          }

          this.comments.comments.find(item => {
            if (item.id === commentId && action === ActionType.like && !item.type) {
              item.type = action;
              item.likesCount += 1;
            } else if (item.id === commentId && action === ActionType.like && item.type) {
              if (item.type === ActionType.like) {
                delete item.type;
                item.likesCount -= 1;
              } else {
                item.type = action;
                item.likesCount += 1;
                item.dislikesCount -= 1;
              }
            } else if (item.id === commentId && action === ActionType.dislike && !item.type) {
              item.type = action;
              item.dislikesCount += 1;
            } else if (item.id === commentId && action === ActionType.dislike && item.type) {
              if (item.type === ActionType.dislike) {
                delete item.type;
                item.dislikesCount -= 1;
              } else {
                item.type = action;
                item.likesCount -= 1;
                item.dislikesCount += 1;
              }
            }
          })

        },
        error: (error: HttpErrorResponse): void => {
          console.log(error.error.message);
        }
      })
  }

  private compareCommentsWithYourActions(): void {
    let found: boolean = false;
    this.comments.comments.forEach(item => {
      found = false;
      this.yourActions.find(action => {
        found = (item.id === action.comment);
        if (found) {
          item.type = action.action;
        }
      })
    })
  }

  public makeAComment(text: string, id: string): void {
    this.articleService.makeAComment({text: text, article: id})
      .subscribe({
        next: (data: DefaultResponseType): void => {
          if ((data as DefaultResponseType).error) {
            throw new Error();
          }

          this.text = '';
          this.getArticle(this.article.url);
        },
        error: (error: HttpErrorResponse): void => {
          console.log(error.message)
        }
      })
  }

  public getMoreComments(): void {
    if (this.offset > this.countOfCommentsAll) {
      return;
    }

    console.log(this.offset)
    console.log(this.countOfComments)

    this.articleService.getCommentsToArticle(this.article.id, this.offset)
      .subscribe({
        next: (data: CommentType | DefaultResponseType): void => {
          if ((data as DefaultResponseType).error !== undefined) {
            throw new Error();
          }

          (data as CommentType).comments.forEach(item => {
            this.comments.comments.push(item);
          })

          if (this.isLogged) {
            this.compareCommentsWithYourActions();
          }
          this.offset += 10;
        },
        error: (error: HttpErrorResponse): void => {
          console.log(error.message)
        }
      })
  }

}

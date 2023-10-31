import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {Observable} from "rxjs";
import {ArticleType} from "../../../types/article.type";
import {DefaultResponseType} from "../../../types/default-response.type";
import {BlogType} from "../../../types/blog.type";
import {ParamsType} from "../../../types/params.type";
import {ArticleCategoriesType} from "../../../types/article-categories.type";
import {FullArticleType} from "../../../types/full-article.type";
import {CommentType} from "../../../types/comment.type";
import {ActionType} from "../../../types/action.type";
import {YourCommentType} from "../../../types/your-comment.type";

@Injectable({
  providedIn: 'root'
})
export class ArticleService {

  constructor(private http: HttpClient) { }

  public getArticleCategories(): Observable<ArticleCategoriesType[] | DefaultResponseType> {
    return this.http.get<ArticleCategoriesType[] | DefaultResponseType>(environment.api + 'categories')
  }

  //Статьи для главной страницы
  public getPopularArticles(): Observable<ArticleType[] | DefaultResponseType> {
    return this.http.get<ArticleType[] | DefaultResponseType>(environment.api + 'articles/top')
  }

  //Для страницы блога
  public getArticles(params: ParamsType): Observable<BlogType | DefaultResponseType> {
    return this.http.get<BlogType | DefaultResponseType>(environment.api + 'articles', {
      params: params
    })
  }

  //Для страницы каждой статьи
  public getArticle(url: string): Observable<FullArticleType | DefaultResponseType> {
    return this.http.get<FullArticleType | DefaultResponseType>(environment.api + 'articles/' + url)
  }

  //Для страницы каждой статьи получить рекомендованые статьи
  public getRelatedArticles(url: string): Observable<ArticleType[] | DefaultResponseType> {
    return this.http.get<ArticleType[] | DefaultResponseType>(environment.api + 'articles/related/' + url)
  }

  //Для страницы каждой получить комментарии
  public getCommentsToArticle(url: string, count: number): Observable<CommentType | DefaultResponseType> {
    return this.http.get<CommentType | DefaultResponseType>(environment.api + 'comments', {
      params: {
        offset: count,
        article: url
      }
    })
  }

  //Публикация комментария
  public makeAComment(param: {text: string, article: string}): Observable<DefaultResponseType> {
    return this.http.post<DefaultResponseType>(environment.api + 'comments', param)
  }

  //Действие с комментом
  public doActionToComment(action: ActionType, commentId: string): Observable<DefaultResponseType> {
    return this.http.post<DefaultResponseType>(environment.api + 'comments/' + commentId + '/apply-action', {
      action: action
    })
  }

  public getSelfActions(articleId: string): Observable<YourCommentType[] | DefaultResponseType> {
    return this.http.get<YourCommentType[] | DefaultResponseType>(environment.api + 'comments/article-comment-actions', {params: {
        articleId: articleId
      }
    })
  }
}

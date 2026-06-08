import {reactive } from 'vue';

const localStorageAuthTokenStr = 'authToken';
const localStorageLanguageStr='language';
const language = localStorage.getItem(localStorageLanguageStr) ? localStorage.getItem(localStorageLanguageStr) : 'en';
let baseURLApiServer='http://localhost/arm_analysis_api/public/api';
let baseURLUploadServer='http://localhost/uploads/public/api';
let baseURLUploadedFilesLink='http://localhost/uploads/public';
let active_site=1;//1=live;2=demo
if(process.env.NODE_ENV=='production')
{
  if(active_site==1){
    baseURLApiServer='https://analysis.api.malikseedsbd.com/api';
    baseURLUploadServer='https://analysis.files.malikseedsbd.com/api';
    baseURLUploadedFilesLink='https://analysis.files.malikseedsbd.com';
  }
  else if(active_site==2){
    baseURLApiServer='https://demo.analysis.api.malikseedsbd.com/api';
    baseURLUploadServer='https://demo.analysis.files.malikseedsbd.com/api';
    baseURLUploadedFilesLink='https://demo.analysis.files.malikseedsbd.com';
  }

}
//else local

function getNotLoggedUser(){
  return {
    authToken: localStorage.getItem(localStorageAuthTokenStr) ? localStorage.getItem(localStorageAuthTokenStr) : '',
    id: 0,
    name: language == 'en' ? 'Guest' : 'অতিথি',
    infos:{},
    profile_picture: '',
    tasks: {}
  }    
}
export default reactive({
  baseURLApiServer:baseURLApiServer,
  baseURLUploadServer:baseURLUploadServer,
  baseURLUploadedFilesLink:baseURLUploadedFilesLink,
  localStorageAuthTokenStr:localStorageAuthTokenStr,
  localStorageLanguageStr:localStorageLanguageStr,
  baseUrl: process.env.BASE_URL,
  statusDataLoaded: 1,    //Loading=0,loaded=1
  uploadingFiles:0,
  validationErrors:'',
  language: language,
  language_available:['en','bn'],
  user: getNotLoggedUser(),  
  logout() {    
    this.user = getNotLoggedUser();
  },
  loadListData:true,
  starting_year:2023,
  current_year:new Date().getFullYear(),
  current_month:new Date().getMonth()+1,
  current_fiscal_year:new Date().getFullYear(),
  sales_starting_year:2022,
  fiscal_year_starting_month:6
})

import {reactive } from 'vue';

const localStorageAuthTokenStr = 'authToken';
const localStorageLanguageStr='language';
const language = localStorage.getItem(localStorageLanguageStr) ? localStorage.getItem(localStorageLanguageStr) : 'en';
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
  baseURLApiServer:(process.env.NODE_ENV=='production')?'https://analysis.api.malikseedsbd.com/api':'http://localhost/arm_analysis_api/public/api',
  baseURLUploadServer:(process.env.NODE_ENV=='production')?'https://analysis.files.malikseedsbd.com/api':'http://localhost/uploads/public/api',
  baseURLUploadedFilesLink:(process.env.NODE_ENV=='production')?'https://analysis.files.malikseedsbd.com':'http://localhost/uploads/public',
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
  starting_year:2025,
  current_year:new Date().getFullYear(),
  current_month:new Date().getMonth(),
  current_fiscal_year:new Date().getFullYear(),
  sales_starting_year:2022,
  fiscal_year_starting_month:6
})

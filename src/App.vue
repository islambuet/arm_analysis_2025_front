<template>
  <div id="system_main_container">
    <Loading v-show="globalVariables.statusDataLoaded == 0" />
    <template v-if="statusSiteLoaded==1">
      <ThemeLogged v-if="globalVariables.user.id > 0" />
      <ThemeLogin v-else />
    </template>
  </div>
</template>
<script setup>
  import globalVariables from "@/assets/globalVariables";
  import systemFunctions from "@/assets/systemFunctions";
  import toastFunctions from "@/assets/toastFunctions";

  import ThemeLogin from "@/components/themes/ThemeLogin.vue";
  import ThemeLogged from "@/components/themes/ThemeLogged/Index.vue";
  import Loading from "@/components/busy-states/Loading.vue";

  import {ref } from 'vue';
  import axios from 'axios';

  import {useRoute,useRouter} from 'vue-router';
  const route =useRoute()
  const router =useRouter()
  //global axios setup
  axios.defaults.baseURL = globalVariables.baseURLApiServer;
  axios.defaults.headers.common['language'] =globalVariables.language;
  axios.defaults.headers.common['Authorization'] = 'Bearer ' + globalVariables.user[globalVariables.localStorageAuthTokenStr];
  axios.interceptors.request.use(function (config) {
    toastFunctions.clearToast()
    globalVariables.validationErrors='';
    globalVariables.statusDataLoaded=0;
    return config;
  }, function (error) {
    return Promise.reject(error);
  });
  axios.interceptors.response.use(function (response) {
    globalVariables.statusDataLoaded=1;
    globalVariables.uploadingFiles=0;
    return response;
  }, function (error) {
    console.log("global error")
    globalVariables.statusDataLoaded=1;
    toastFunctions.showServerNotRespondingError();
    globalVariables.uploadingFiles=0;
    return Promise.reject(error);
  });
  //global axios end
  let statusSiteLoaded=ref(0);
  const init=async ()=>{
    await axios.get('/user/initialize').then((res)=>{
      if (res.data.error == "") {
        if(res.data.current_season_id){
          globalVariables.current_season_id=res.data.current_season_id;
        }
        if(res.data.user){
          systemFunctions.setUser(res.data.user);
        }
        else{
          if(route.path!='/login'){
            router.push("/login");
          }
        }
      }
      else{
        toastFunctions.showResponseError(res.data)
      }


      statusSiteLoaded.value=1;
    });
  }
  init();
</script>
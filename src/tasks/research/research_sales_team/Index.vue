<template>
  <div v-if="taskData.permissions.action_0==1">
    <div v-show="taskData.method=='list'">
      <List/>
    </div>
    <div v-if="taskData.method=='add'">
      <AddEdit/>
    </div>
    <div v-if="taskData.method=='edit'">
      <AddEdit/>
    </div>
    <div v-if="taskData.method=='details'">
      <Details/>
    </div>
  </div>
</template>
<script setup>
  import globalVariables from "@/assets/globalVariables";
  import systemFunctions from "@/assets/systemFunctions";
  import toastFunctions from "@/assets/toastFunctions";
  import labels from '@/labels'
  import {provide, reactive, watch} from 'vue'
  import {useRoute,useRouter} from 'vue-router';
  import axios from 'axios';

  import List from './List.vue'
  import AddEdit from './AddEdit.vue'
  import Details from './Details.vue'

  globalVariables.loadListData=true;
  const route =useRoute()
  const router =useRouter()

  let taskData=reactive({
    api_url:systemFunctions.getTaskBaseURL(import.meta.url),
    method:'list',

    permissions:{},

    items: {data:[]},   //from Laravel server with pagination and info
    itemsFiltered: [],    //for display
    columns:{all:{},hidden:[],sort:{key:'',dir:''}},
    pagination: {current_page: 1,per_page_options: [10,20,50,100,500,1000],per_page:-1,show_all_items:true},
    user_locations:{},
    analysis_year_id:0,
    crops:[],
    crop_types:[],
    analysis_years:[],
    location_districts :[],
  })
  labels.add([{language:globalVariables.language,file:'tasks'+taskData.api_url+'/labels.js'}])
  const routing=async ()=>{
    let analysis_year_id=route.params['analysis_year_id']?route.params['analysis_year_id']:0;
    if(analysis_year_id==0 ){
      analysis_year_id=taskData.analysis_years[taskData.analysis_years.length-1].id;
      await router.push(taskData.api_url+'/'+analysis_year_id)
      return;
    }
    taskData.analysis_year_id=analysis_year_id
    await getItems(taskData.pagination);//Load at least once
    if(route.path==(taskData.api_url+'/'+taskData.analysis_year_id)){
      taskData.method='list';
    }
    else if(route.path.indexOf(taskData.api_url+'/'+taskData.analysis_year_id+'/edit/')!=-1)
    {
      taskData.method='edit';
    }
    else if(route.path.indexOf(taskData.api_url+'/'+taskData.analysis_year_id+'/details/')!=-1)
    {
      taskData.method='details';
    }
  }
  watch(route, () => {
    routing();
  })


  const getItems=async(pagination)=>{
    let items={};
    items['data']=taskData.location_districts;
    items['current_page']=1;
    items['last_page1']=1;
    items['total']=taskData.location_districts.length;
    taskData.items= items;
    taskData.setFilteredItems();
  }
  taskData.setFilteredItems=()=>{
    taskData.itemsFiltered=systemFunctions.getFilteredItems(taskData.items.data,taskData.columns);
  }
  taskData.reloadItems=(pagination)=>{
    globalVariables.loadListData=true;
    getItems(pagination);
  }
  const init=async ()=>{
    await axios.get(taskData.api_url+'/initialize').then((res)=>{
      if (res.data.error == "") {
        taskData.permissions=res.data.permissions;
        taskData.user_locations=res.data.user_locations;
        taskData.crops=res.data.crops;
        taskData.crop_types=res.data.crop_types;
        taskData.analysis_years=res.data.analysis_years;
        taskData.location_districts=res.data.location_districts;
        if(res.data.hidden_columns){
          taskData.columns.hidden=res.data.hidden_columns;
        }
        routing();
      }
      else{
        toastFunctions.showResponseError(res.data)
      }
    });
  }
  provide('taskData',taskData)
  if(!(globalVariables.user.id>0)){
    router.push("/login")
  }
  else{
    init();
  }
</script>

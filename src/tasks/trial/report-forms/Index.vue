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
    <div v-if="taskData.method=='fields'">
      <Fields/>
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
  import Fields from './Fields.vue'

  globalVariables.loadListData=true;
  const route =useRoute()
  const router =useRouter()

  let taskData=reactive({
    api_url:systemFunctions.getTaskBaseURL(import.meta.url),
    method:'',
    permissions:{},
    items: {data:[]},   //from Laravel server with pagination and info
    itemsFiltered: [],    //for display
    columns:{all:{},hidden:[],sort:{key:'',dir:''}},
    pagination: {current_page: 1,per_page_options: [10,20,50,100,500,1000],per_page:-1,show_all_items:true},

    crop_id:0,
    cropInfo:{},
    trialFormInputs:{}
  })
  labels.add([{language:globalVariables.language,file:'tasks'+taskData.api_url+'/labels.js'}])

  const routing=async ()=>{
    taskData.method='';//to avoid other calls
    let crop_id=route.params['crop_id']?route.params['crop_id']:0;
    if(taskData.crop_id!=crop_id){
      taskData.permissions={};//resetting permission to rerender
      globalVariables.loadListData=true;
      taskData.crop_id=crop_id;
      await init();
    }
    await getItems(taskData.pagination);//Load at least once
    if(route.path==(taskData.api_url+'/'+taskData.crop_id)){
      taskData.method='list';
    }
    else if(route.path==(taskData.api_url+'/'+taskData.crop_id+'/add')){
      taskData.method='add';
    }
    else if(route.path.indexOf(taskData.api_url+'/'+taskData.crop_id+'/edit/')!=-1)
    {
      taskData.method='edit';
    }
    else if(route.path.indexOf(taskData.api_url+'/'+taskData.crop_id+'/details/')!=-1)
    {
      taskData.method='details';
    }
    else if(route.path.indexOf(taskData.api_url+'/'+taskData.crop_id+'/fields/')!=-1)
    {
      taskData.method='fields';
    }
  }
  watch(route, () => {
    routing();
  })
  const init=async ()=>{
    await axios.get(taskData.api_url+'/'+taskData.crop_id+'/initialize').then((res)=>{
      if (res.data.error == "") {
        taskData.permissions=res.data.permissions;
        taskData.cropInfo=res.data.cropInfo;
        taskData.trialFormInputs=res.data.trialFormInputs;
        if(res.data.hidden_columns){
          taskData.columns.hidden=res.data.hidden_columns;
        }
      }
      else{
        toastFunctions.showResponseError(res.data)
      }
    });
  }

  const getItems=async(pagination)=>{
    if(globalVariables.loadListData)
    {
      await axios.get(taskData.api_url+'/'+taskData.crop_id+'/get-items?page='+ pagination.current_page+'&perPage='+ pagination.per_page)
        .then(res => {
          if(res.data.error==''){
            taskData.items= res.data.items;
            taskData.setFilteredItems();
          }
          else{
            toastFunctions.showResponseError(res.data)
          }
          globalVariables.loadListData=false;
        })
    }
  }
  taskData.setFilteredItems=()=>{
    taskData.itemsFiltered=systemFunctions.getFilteredItems(taskData.items.data,taskData.columns);
  }
  taskData.reloadItems=(pagination)=>{
    globalVariables.loadListData=true;
    getItems(pagination);
  }

  provide('taskData',taskData)
  if(!(globalVariables.user.id>0)){
    router.push("/login")
  }
  else{
    routing();
  }
</script>

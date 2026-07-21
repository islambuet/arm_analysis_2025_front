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

    analysis_years:[],
    location_parts:[],
    location_areas:[],
    location_territories:[],
    location_upazilas:[],
    distributors:[],
    dealers:[],
    seasons:[],

    crops:[],
    crop_types:[],
    varieties:[],
    pack_sizes :[],
    user_locations:{},
    lastGeneratedDate: {},
    bonus_setup: {},
  })
  labels.add([{language:globalVariables.language,file:'tasks'+taskData.api_url+'/labels.js'}])

  const routing=async ()=>{
    await getItems(taskData.pagination);//Load at least once
    if(route.path==taskData.api_url){
      taskData.method='list';
    }
    else if(route.path==taskData.api_url+'/add'){
      taskData.method='add';
    }
    else if(route.path.indexOf(taskData.api_url+'/edit/')!=-1)
    {
      taskData.method='edit';
    }
    else if(route.path.indexOf(taskData.api_url+'/details/')!=-1)
    {
      taskData.method='details';
    }
  }
  watch(route, () => {
    routing();
  })


  const getItems=async(pagination)=>{
    if(globalVariables.loadListData)
    {
      await axios.get(taskData.api_url+'/get-items?page='+ pagination.current_page+'&perPage='+ pagination.per_page)
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
  const init=async ()=>{
    await axios.get(taskData.api_url+'/initialize').then((res)=>{
      if (res.data.error == "") {
        taskData.permissions=res.data.permissions;
        taskData.location_parts=res.data.location_parts;
        taskData.location_areas=res.data.location_areas;
        taskData.location_territories=res.data.location_territories;
        taskData.distributors=res.data.distributors;
        taskData.dealers=res.data.dealers;
        taskData.lastGeneratedDate=res.data.lastGeneratedDate;

        taskData.crops=res.data.crops;
        taskData.crop_types=res.data.crop_types;
        let bonus_setup={}
        for(let i in res.data.bonus_setup){
          let row=res.data.bonus_setup[i];
          row['crop_name']=taskData.crops.find(t=>t.id==row['crop_id'])?.name;
          let html='';
          let crop_type_ids=row['crop_type_ids'].split(',');
          for(let j=1;j<crop_type_ids.length-1;j++){
            let crop_type_id=crop_type_ids[j];
            html+=(taskData.crop_types.find(t=>t.id==crop_type_id)?.name+'<br>')
          }
          row['crop_type_name']=html
          bonus_setup[row['id']]=row;
        }
        taskData.bonus_setup=bonus_setup;

        taskData.user_locations=res.data.user_locations;

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

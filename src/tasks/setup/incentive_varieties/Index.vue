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
    crops:[],
    crop_types:[],
    varieties :[],
    incentive_slabs:[],
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
              let items={};
              items['data']=[];
              for(let i in taskData.varieties){
                let datum=taskData.varieties[i];
                for(let j in taskData.incentive_slabs){
                  let slab=taskData.incentive_slabs[j];
                  datum['slab_'+slab.id]='';
                  if(res.data.items[datum.id]){
                    if(res.data.items[datum.id][slab.id]){
                      datum['slab_'+slab.id]=res.data.items[datum.id][slab.id];
                    }

                  }
                }
                items['data'].push(datum)
              }
              items['current_page']=1;
              items['last_page1']=1;
              items['total']=items['data'].length;
              taskData.items= items;
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
        taskData.crops=res.data.crops;
        taskData.crop_types=res.data.crop_types;
        taskData.varieties=res.data.varieties;
        taskData.incentive_slabs=res.data.incentive_slabs;
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

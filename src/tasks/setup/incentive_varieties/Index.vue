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
  import {provide, reactive, ref, watch} from 'vue'
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
    fiscal_year:0
  })
  labels.add([{language:globalVariables.language,file:'tasks'+taskData.api_url+'/labels.js'}])

  const routing=async ()=>{
    let fiscal_year=route.params['fiscal_year']?route.params['fiscal_year']:0;
    if(fiscal_year==0 ){
      fiscal_year=globalVariables.current_fiscal_year;
      await router.push(taskData.api_url+'/'+fiscal_year)
      return;
    }
    taskData.fiscal_year=fiscal_year
    await getItems(taskData.pagination);//Load at least once
    if(route.path==(taskData.api_url+'/'+taskData.fiscal_year)){
      taskData.method='list';
    }
    else if(route.path.indexOf(taskData.api_url+'/'+taskData.fiscal_year+'/edit/')!=-1)
    {
      taskData.method='edit';
    }
    else if(route.path.indexOf(taskData.api_url+'/'+taskData.fiscal_year+'/details/')!=-1)
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
      await axios.get(taskData.api_url+'/'+taskData.fiscal_year+'/get-items?page='+ pagination.current_page+'&perPage='+ pagination.per_page)
          .then(res => {
            if(res.data.error==''){
              taskData.setColumns();
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
  taskData.setColumns=()=>{
    let columns={}
    let key='name';
    columns[key]={
      label: labels.get('label_'+key),
      hideable:false,
      filterable:true,
      sortable:true,
      type:'text',
      filter:{from:'',to:''}
    };
    key='crop_name';
    columns[key]={
      label: labels.get('label_'+key),
      hideable:true,
      filterable:true,
      sortable:true,
      type:'dropdown',
      filter:{from:'',to:'',options:taskData.crops.map((item)=>{ return {value:item.name,label:item.name}}),}
    };
    key='crop_type_name';
    columns[key]={
      label: labels.get('label_'+key),
      hideable:true,
      filterable:true,
      sortable:true,
      type:'text',
      filter:{from:'',to:''}
    };
    for(let i=0;i<taskData.incentive_slabs.length;i++){
      let slab=taskData.incentive_slabs[i];
      key='slab_'+slab.id;
      if(slab.fiscal_year==taskData.fiscal_year){
        columns[key]={
          label: slab.name+'%+',
          hideable:false,
          filterable:false,
          sortable:false,
          type:'number',
          filter:{from:'',to:''},
          class:'col_1'
        };
      }
    }
    taskData.columns.all=columns
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

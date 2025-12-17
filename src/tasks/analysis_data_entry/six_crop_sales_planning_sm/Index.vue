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
    pagination: {current_page: 1,per_page_options: [10,20,50,100,200,500,1000],per_page:200,show_all_items:false},

    analysis_years:[],
    location_parts:[],
    location_areas:[],
    location_territories:[],
    distributors:[],
    seasons:[],

    crops:[],
    crop_types:[],
    varieties:[],
    varieties_competitor_typewise:{},
    varieties_competitor_typewise_ordered:{},
    pack_sizes :[],
    user_locations:{},

    fiscal_year:globalVariables.current_fiscal_year,
    season_id:0,
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
    else if(route.path==taskData.api_url+'/upload'){
      taskData.method='upload';
    }
  }
  watch(route, () => {
    routing();
  })
  const getItems=async()=>{
    if(globalVariables.loadListData) {
      let fiscal_year = $("#fiscal_year").val();
      let season_id = $("#season_id").val();
      if (fiscal_year > 0 && season_id > 0) {
        await axios.get(taskData.api_url + '/get-items/' + fiscal_year + '_' + season_id)
            .then(res => {
              let items = {};
              items['data'] = [];
              if (res.data.error == '') {
                for (let i in taskData.location_territories) {
                  let territoryData = Object.assign({}, taskData.location_territories[i]);
                  let territory_id = territoryData['id']
                  if (taskData.user_locations['part_id'] > 0) {
                    if (taskData.user_locations['part_id'] != territoryData['part_id']) {
                      continue;
                    }
                  }
                  if (taskData.user_locations['area_id'] > 0) {
                    if (taskData.user_locations['area_id'] != territoryData['area_id']) {
                      continue;
                    }
                  }
                  if (taskData.user_locations['territory_id'] > 0) {
                    if (taskData.user_locations['territory_id'] != territory_id) {
                      continue;
                    }
                  }
                  territoryData['total_type_entered'] = res.data.items[territory_id] ? res.data.items[territory_id]['total_type_entered'] : 0;
                  territoryData['total_type_competitor'] = res.data.items[territory_id] ? res.data.items[territory_id]['total_type_competitor'] : 0;
                  territoryData['total_type_arm'] = res.data.items[territory_id] ? res.data.items[territory_id]['total_type_arm'] : 0;
                  territoryData['id'] = fiscal_year + '_' + season_id + '_' + territory_id
                  items['data'].push(territoryData)
                }
              } else {
                toastFunctions.showResponseError(res.data)
              }
              items['current_page'] = 1;
              items['last_page1'] = 1;
              items['total'] = items['data'].length;
              taskData.items = items;
              taskData.setFilteredItems();
              globalVariables.loadListData=false;
            })
      }
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

        taskData.crops=res.data.crops;
        taskData.crop_types=res.data.crop_types;
        taskData.varieties_competitor_typewise=res.data.varieties_competitor_typewise;
        taskData.varieties_competitor_typewise_ordered=res.data.varieties_competitor_typewise_ordered;

        taskData.seasons=res.data.seasons;

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

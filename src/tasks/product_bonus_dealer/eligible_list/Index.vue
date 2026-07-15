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

globalVariables.loadListData=false;
const route =useRoute()
const router =useRouter()

let taskData=reactive({
  api_url:systemFunctions.getTaskBaseURL(import.meta.url),
  method:'list',

  permissions:{},

  items: {data:[]},   //from Laravel server with pagination and info
  itemsFiltered: [],    //for display
  columns:{all:{},hidden:[],sort:{key:'',dir:''}},
  pagination: {current_page: 1,per_page_options: [10,20,50,100,200,500,1000],per_page:-1,show_all_items:true},

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
  varieties_competitor_typewise:{},
  varieties_competitor_typewise_ordered:{},
  varieties_arm_typewise:{},
  varieties_arm_typewise_ordered:{},
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
    let crop_id=$('#list_search_crop_id').val();
    let formData=new FormData(document.getElementById('formListSearch'))
    formData.set('page',pagination.current_page)
    formData.set('perPage',pagination.per_page)
    await axios.post(taskData.api_url+'/get-items',formData)
        .then(res => {
          if (res.data.error == '') {

            let bonus_items=res.data.items;
            let rows=[]
            for(let i in bonus_items){
              let bonus_item=bonus_items[i];
              let bonus_data=JSON.parse(bonus_item['bonus_data'])
              for(let j in bonus_data){
                let bonus_datum=bonus_data[j];
                //if(crop_id>0 && crop_id!=taskData.bonus_setup[])
                if(crop_id>0){
                  if(taskData.bonus_setup[j]['crop_id']!=crop_id)
                    continue;
                }
                if((+bonus_datum['quantity_sales'])+(+bonus_datum['quantity_balance_old'])>=(+bonus_datum['quantity_eligible']))
                {
                  let row={}
                  row['id']=(bonus_item['id']+'_'+j)
                  row['part_name']=(bonus_item['part_name'])
                  row['area_name']=(bonus_item['area_name'])
                  row['territory_name']=(bonus_item['territory_name'])
                  row['dealer_name']=(bonus_item['dealer_name'])
                  row['crop_name']=(taskData.bonus_setup[j]?taskData.bonus_setup[j]['crop_name']:j);
                  row['crop_type_name']=(taskData.bonus_setup[j]?taskData.bonus_setup[j]['crop_type_name']:j);
                  row['quantity_eligible']=(bonus_datum['quantity_eligible'])
                  row['quantity_sales']=(bonus_datum['quantity_sales'])
                  row['quantity_balance_old']=(bonus_datum['quantity_balance_old'])
                  row['quantity_delivered']=(bonus_datum['quantity_delivered'])
                  row['quantity_balance_new']=(bonus_datum['quantity_balance_new'])
                  rows.push(row)
                }
              }
            }


            let items = {};
            items['data'] =rows;
            items['current_page'] = 1;
            items['last_page'] = 1;
            items['total'] = items['data'].length;
            taskData.items = items;
            taskData.setFilteredItems();
          } else {
            toastFunctions.showResponseError(res.data)
          }
          globalVariables.loadListData = false;
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
taskData.getPartDropdownHtml=(user_part_id=0,selected=0)=>{
  let html='<option value="">'+labels.get('label_select')+'</option>';
  if(user_part_id>0){
    html='<option value="'+user_part_id+'">'+taskData.location_parts.find(temp=>temp.id==user_part_id)?.name+'</option>';
  }
  else{
    for(let i in taskData.location_parts){
      let location=taskData.location_parts[i];
      html+=('<option value="'+location['id']+'"'+(selected==location['id']?'selected':'')+' >'+location['name']+'</option>');
    }
  }

  return html;
}
taskData.getAreaDropdownHtml=(part_id,user_area_id=0,selected=0)=>{
  let html='<option value="">'+labels.get('label_select')+'</option>';
  if(user_area_id>0){
    html='<option value="'+user_area_id+'">'+taskData.location_areas.find(temp=>temp.id==user_area_id)?.name+'</option>';
  }
  else{
    for(let i in taskData.location_areas){
      let location=taskData.location_areas[i];
      if(location['part_id']==part_id){
        html+=('<option value="'+location['id']+'"'+(selected==location['id']?'selected':'')+' >'+location['name']+'</option>');
      }
    }
  }
  return html;
}
taskData.getTerritoryDropdownHtml=(area_id,user_territory_id=0,selected=0)=>{
  let html='<option value="">'+labels.get('label_select')+'</option>';
  if(user_territory_id>0){
    html='<option value="'+user_territory_id+'">'+taskData.location_territories.find(temp=>temp.id==user_territory_id)?.name+'</option>';
  }
  else{
    for(let i in taskData.location_territories){
      let location=taskData.location_territories[i];
      if(location['area_id']==area_id){
        html+=('<option value="'+location['id']+'"'+(selected==location['id']?'selected':'')+' >'+location['name']+'</option>');
      }
    }
  }
  return html;
}
taskData.getDealerDropdownHtml=(territory_id,selected=0)=>{
  let html='<option value="">'+labels.get('label_select')+'</option>';
  for(let i in taskData.dealers){
    let location=taskData.dealers[i];
    if(location['territory_id']==territory_id){
      html+=('<option value="'+location['id']+'"'+(selected==location['id']?'selected':'')+' >'+location['name']+'</option>');
    }
  }
  return html;
}
provide('taskData',taskData)
if(!(globalVariables.user.id>0)){
  router.push("/login")
}
else{
  init();
}
</script>

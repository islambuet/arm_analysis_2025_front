<template>
  <div class="card d-print-none mb-2">
    <div class="card-body">
      <router-link :to="taskData.api_url" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" ><i class="feather icon-corner-up-left"></i> {{labels.get('label_back')}}</router-link>
      <template v-if="item.exists">
        <button v-if="item.status=='Pending'"  type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" @click="save(false)"><i class="feather icon-save"></i> {{labels.get('label_save')}}</button>
        <button v-if="item.status=='Approved'" type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-primary disabled">{{item.status}}</button>
      </template>
    </div>
  </div>
  <div class="card d-print-none mb-2" >
    <div class="card-header">
      <div v-if="item.id>0">{{labels.get('label_edit_task')}}({{item.id}})</div>
      <div v-else>{{labels.get('label_new_task')}}</div>
    </div>
    <div class="card-body">
      <form id="formSaveItem">
        <InputTemplate :inputItems="item.inputFields" />
      </form>
    </div>
  </div>
</template>
<script setup>

import globalVariables from "@/assets/globalVariables";
import systemFunctions from "@/assets/systemFunctions";
import toastFunctions from "@/assets/toastFunctions";
import labels from '@/labels'

import {useRouter} from "vue-router";
import {inject, reactive} from "vue";
import axios from "axios";
import InputTemplate from '@/components/InputTemplate.vue';
import {useRoute} from "vue-router/dist/vue-router";


const route =useRoute()
const router =useRouter()
let taskData = inject('taskData')
let item=reactive({
  id:0,
  exists:false,
  status:"Pending",
  inputFields:{},
  data:{
    id:0,
    part_id:'',
    area_id:'',
    territory_id:'',
    distributor_id:'',
    dealer_id:'',
    amount:'',
    status:'Pending',
  }
})

let location_parts_object={};
for(let i in taskData.location_parts){
  let part_id=taskData.location_parts[i]['id'];
  location_parts_object[part_id]=taskData.location_parts[i];
}
let location_areas_object={};
for(let i in taskData.location_areas){
  let area_id=taskData.location_areas[i]['id'];
  location_areas_object[area_id]=taskData.location_areas[i];
}
let location_territories_object={};
for(let i in taskData.location_territories){
  let territory_id=taskData.location_territories[i]['id'];
  location_territories_object[territory_id]=taskData.location_territories[i];
}
let distributors_object={};
for(let i in taskData.distributors){
  let distributor_id=taskData.distributors[i]['id'];
  distributors_object[distributor_id]=taskData.distributors[i];
}
const setInputFields=async ()=>{
  item.inputFields= {};
  await systemFunctions.delay(1);
  let inputFields={}
  let key='save_token';
  inputFields[key] = {
    name: key,
    label: labels.get('label_'+key),
    type:'hidden',
    default:new Date().getTime(),
    mandatory:true
  };
  key='id';
  inputFields[key] = {
    name: key,
    label: labels.get('label_'+key),
    type:'hidden',
    default:item.data[key],
    mandatory:true
  };
  key='payment_at';
  inputFields[key] = {
    name: 'item[' +key +']',
    label: labels.get('label_'+key),
    type:'date',
    //default:systemFunctions.getDatePart(item.data[key]),
    default:moment(item.data[key]).format('YYYY-MM-DD'),
    mandatory:true
  };
  key='part_id';
  inputFields[key] = {
    name: key,
    label: labels.get('label_'+key),
    type:'dropdown',
    options:taskData.location_parts.filter((temp)=>{ if(temp.status=='Active'){temp.value=temp.id.toString();temp.label=temp.name;return true}}),
    default:item.data[key],
    mandatory:true
  };
  if(taskData.user_locations.part_id>0){
    item.data['part_id']=taskData.user_locations.part_id;
    inputFields[key] = {
      name: key,
      label: labels.get('label_'+key),
      type:'hidden',
      default:taskData.user_locations.part_id,
      mandatory:true
    };
    key='part_name';
    inputFields[key] = {
      name: key,
      label: labels.get('label_'+key),
      type:'textonly',
      default: location_parts_object[taskData.user_locations.part_id]['name'],
      mandatory:true
    };
  }
  key='area_id';
  inputFields[key] = {
    name: 'area_id',
    label: labels.get('label_'+key),
    type:'dropdown',
    options:item.data['part_id']>0?taskData.location_areas.filter((temp)=>{ if(temp.part_id==item.data['part_id']){temp.value=temp.id.toString();temp.label=temp.name;return true}}):[],
    default:item.data[key],
    mandatory:true
  };
  if(taskData.user_locations.area_id>0){
    item.data['area_id']=taskData.user_locations.area_id;
    inputFields[key] = {
      name: key,
      label: labels.get('label_'+key),
      type:'hidden',
      default:taskData.user_locations.area_id,
      mandatory:true
    };
    key='area_name';
    inputFields[key] = {
      name: key,
      label: labels.get('label_'+key),
      type:'textonly',
      default: location_areas_object[taskData.user_locations.area_id]['name'],
      mandatory:true
    };
  }
  key='territory_id';
  inputFields[key] = {
    name: 'territory_id',
    label: labels.get('label_'+key),
    type:'dropdown',
    options:item.data['area_id']>0?taskData.location_territories.filter((temp)=>{ if(temp.area_id==item.data['area_id']){temp.value=temp.id.toString();temp.label=temp.name;return true}}):[],
    default:item.data[key],
    mandatory:true
  };
  if(taskData.user_locations.territory_id>0){
    item.data['territory_id']=taskData.user_locations.territory_id;
    inputFields[key] = {
      name: key,
      label: labels.get('label_'+key),
      type:'hidden',
      default:taskData.user_locations.territory_id,
      mandatory:true
    };
    key='territory_name';
    inputFields[key] = {
      name: key,
      label: labels.get('label_'+key),
      type:'textonly',
      default: location_territories_object[taskData.user_locations.territory_id]['name'],
      mandatory:true
    };
  }
  key='distributor_id';
  inputFields[key] = {
    name: key,
    label: labels.get('label_'+key),
    type:'dropdown',
    options:item.data['territory_id']>0?taskData.distributors.filter((temp)=>{ if(temp.territory_id==item.data['territory_id']){temp.value=temp.id.toString();temp.label=temp.name;return true}}):[],
    default:item.data[key],
    mandatory:true
  };
  key='dealer_id';
  inputFields[key] = {
    name: 'item[' +key +']',
    label: labels.get('label_'+key),
    type:'dropdown',
    options:item.data['distributor_id']>0?taskData.dealers.filter((temp)=>{ if(temp.distributor_id==item.data['distributor_id']){temp.value=temp.id.toString();temp.label=temp.name;return true}}):[],
    default:item.data[key],
    mandatory:true
  };
  key='amount';
  inputFields[key] = {
    name: 'item[' +key +']',
    label: labels.get('label_'+key),
    type:'number',
    default:item.data[key],
    mandatory:true
  };
  item.inputFields=inputFields;

}
const save=async (save_and_new)=>{
  let formData=new FormData(document.getElementById('formSaveItem'))
  await axios.post(taskData.api_url+'/save-item',formData).then((res)=>{
    if (res.data.error == "") {
      globalVariables.loadListData=true;
      toastFunctions.showSuccessfullySavedMessage();
      router.push(taskData.api_url)
    }
    else{
      toastFunctions.showResponseError(res.data)
    }
  });

}
const getItem=async ()=>{
  await axios.get(taskData.api_url+'/get-item/'+ item.id).then((res)=>{
    if (res.data.error == "") {
      item.data=res.data.item;
      item.status=res.data.item.status;
      setInputFields();
      item.exists=true;
    }
    else{
      toastFunctions.showResponseError(res.data)
    }
  });
}
item.id=route.params['item_id']?route.params['item_id']:0;


$(document).ready(async function()
{

  $(document).off("change", "#part_id");
  $(document).on("change",'#part_id',async function()
  {
    let part_id=$(this).val();
    let key='area_id';
    item.inputFields[key].options=taskData.location_areas.filter((temp)=>{ if((temp.part_id==part_id) && (temp.status=='Active')){temp.value=temp.id.toString();temp.label=temp.name;return true}})
    await systemFunctions.delay(1);
    $('#'+key).val('');
    key='territory_id';
    item.inputFields[key].options=[];
    $('#'+key).val('');
    key='distributor_id';
    item.inputFields[key].options=[];
    $('#'+key).val('');
    key='dealer_id';
    item.inputFields[key].options=[];
    $('#'+key).val('');
  })
  $(document).off("change", "#area_id");
  $(document).on("change",'#area_id',async function()
  {
    let area_id=$(this).val();
    let key='territory_id';
    item.inputFields[key].options=taskData.location_territories.filter((temp)=>{ if((temp.area_id==area_id)&& (temp.status=='Active')){temp.value=temp.id.toString();temp.label=temp.name;return true}})
    await systemFunctions.delay(1);
    $('#'+key).val('');
    key='distributor_id';
    item.inputFields[key].options=[];
    $('#'+key).val('');
    key='dealer_id';
    item.inputFields[key].options=[];
    $('#'+key).val('');
  })
  $(document).off("change", "#territory_id");
  $(document).on("change",'#territory_id',async function()
  {
    let territory_id=$(this).val();
    let key='distributor_id';
    item.inputFields[key].options=taskData.distributors.filter((temp)=>{ if((temp.territory_id==territory_id)&& (temp.status=='Active')){temp.value=temp.id.toString();temp.label=temp.name;return true}})
    await systemFunctions.delay(1);
    $('#'+key).val('');
    key='dealer_id';
    item.inputFields[key].options=[];
    $('#'+key).val('');
  })
  $(document).off("change", "#distributor_id");
  $(document).on("change",'#distributor_id',async function()
  {
    let distributor_id=$(this).val();
    let key='dealer_id';
    item.inputFields[key].options=taskData.dealers.filter((temp)=>{ if((temp.distributor_id==distributor_id)&& (temp.status=='Active')){temp.value=temp.id.toString();temp.label=temp.name;return true}})
    await systemFunctions.delay(1);
    $('#'+key).val('');
  })
  $(document).off("change", "#dealer_id");

});
if(item.id>0){
  if(!(taskData.permissions.action_2)){
    toastFunctions.showAccessDenyMessage();
  }
  else{
    getItem();
  }
}
else{
  if(!(taskData.permissions.action_1)){
    toastFunctions.showAccessDenyMessage();
  }
  else{
    setInputFields();
    item.exists=true;
  }
}
</script>
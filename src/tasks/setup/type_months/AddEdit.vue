<template>
  <div class="card d-print-none mb-2">
    <div class="card-body">
      <router-link :to="taskData.api_url" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" ><i class="feather icon-corner-up-left"></i> {{labels.get('label_back')}}</router-link>
      <template v-if="item.exists">
        <button  type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" @click="save(false)"><i class="feather icon-save"></i> {{labels.get('label_save')}}</button>
        <button  type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" @click="save(true)"><i class="feather icon-plus-square"></i> {{labels.get('label_save_new')}}</button>
      </template>
    </div>
  </div>
  <div class="card d-print-none mb-2" v-if="item.exists">
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
  inputFields:{},
  data:{
    id:0,
    name:'',
    part_id:'',
    area_id:'',
    territory_id:'',
    crop_id:'',
    type_id:'',
    month_start:'',
    month_end:'',
  }
})
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

  key='part_id';
  inputFields[key] = {
    name: 'part_id',
    label: labels.get('label_'+key),
    type:'dropdown',
    options:taskData.location_parts.map((temp)=>{ return {value:temp.id,label:temp.name}}),
    default:item.data[key],
    mandatory:true
  };
  key='area_id';
  inputFields[key] = {
    name: 'area_id',
    label: labels.get('label_'+key),
    type:'dropdown',
    options:item.data['part_id']>0?taskData.location_areas.filter((temp)=>{ if(temp.part_id==item.data['part_id']){temp.value=temp.id.toString();temp.label=temp.name;return true}}):[],
    default:item.data[key],
    mandatory:true
  };
  key='territory_id';
  inputFields[key] = {
    name: 'item[' +key +']',
    label: labels.get('label_'+key),
    type:'dropdown',
    options:item.data['area_id']>0?taskData.location_territories.filter((temp)=>{ if(temp.area_id==item.data['area_id']){temp.value=temp.id.toString();temp.label=temp.name;return true}}):[],
    default:item.data[key],
    mandatory:true
  };

  key='crop_id';
  inputFields[key] = {
    name: 'crop_id',
    label: labels.get('label_'+key),
    type:'dropdown',
    options:taskData.crops.map((temp)=>{ return {value:temp.id,label:temp.name}}),
    default:item.data[key],
    mandatory:true
  };
  key='type_id';
  inputFields[key] = {
    name: 'item[' +key +']',
    label: labels.get('label_'+key),
    type:'dropdown',
    options:item.data['crop_id']>0?taskData.crop_types.filter((temp)=>{ if(temp.crop_id==item.data['crop_id']){temp.value=temp.id.toString();temp.label=temp.name;return true}}):[],
    default:item.data[key],
    mandatory:true
  };
  key='month_start';
  inputFields[key] = {
    name: 'item[' +key +']',
    label: labels.get('label_'+key),
    type:'dropdown',
    options:new Array(12).fill().map((temp,index) => {return {value:index+1,label:labels.get('label_month_short_'+(index+1))}}),
    default:item.data[key],
    mandatory:true
  };

  key='month_end';
  inputFields[key] = {
    name: 'item[' +key +']',
    label: labels.get('label_'+key),
    type:'dropdown',
    options:new Array(12).fill().map((temp,index) => {return {value:index+1,label:labels.get('label_month_short_'+(index+1))}}),
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
      if(save_and_new){
        if(item.id>0){
          router.push(taskData.api_url+"/add")
        }
        else{
          setInputFields();
        }
      }
      else{
        router.push(taskData.api_url)
      }
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
      setInputFields();
      item.exists=true;
    }
    else{
      toastFunctions.showResponseError(res.data)
    }
  });
}
  item.id=route.params['item_id']?route.params['item_id']:0;

$(document).ready(function()
{
  $(document).off("change", "#part_id");
  $(document).on("change",'#part_id',async function()
  {
    let part_id=$(this).val();
    let key='area_id';
    item.inputFields[key].options=taskData.location_areas.filter((temp)=>{ if(temp.part_id==part_id){temp.value=temp.id.toString();temp.label=temp.name;return true}})
    await systemFunctions.delay(1);
    $('#'+key).val('');
    key='territory_id';
    item.inputFields[key].options=[];
    $('#'+key).val('');
  })
  $(document).off("change", "#area_id");
  $(document).on("change",'#area_id',async function()
  {
    let area_id=$(this).val();
    let key='territory_id';
    item.inputFields[key].options=taskData.location_territories.filter((temp)=>{ if(temp.area_id==area_id){temp.value=temp.id.toString();temp.label=temp.name;return true}})
    await systemFunctions.delay(1);
    $('#'+key).val('');
  })
  $(document).off("change", "#crop_id");
  $(document).on("change",'#crop_id',async function()
  {
    let crop_id=$(this).val();
    let key='type_id';
    item.inputFields[key].options=taskData.crop_types.filter((temp)=>{ if(temp.crop_id==crop_id){temp.value=temp.id.toString();temp.label=temp.name;return true}})
    await systemFunctions.delay(1);
    $('#'+key).val('');

  })
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
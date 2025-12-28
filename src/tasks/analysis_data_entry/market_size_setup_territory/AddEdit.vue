<template>
  <div class="card d-print-none mb-2">
    <div class="card-body">
      <router-link :to="taskData.api_url" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" ><i class="feather icon-corner-up-left"></i> {{labels.get('label_back')}}</router-link>
      <template v-if="item.exists">
        <button  type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" @click="save(false)"><i class="feather icon-save"></i> {{labels.get('label_save')}}</button>
      </template>
    </div>
  </div>
  <div class="card d-print-none mb-2" >
    <div class="card-header d-print-none">
      {{labels.get('label_task')}}
    </div>
    <div class="card-body">
      <form id="formSaveItem">
        <InputTemplate :inputItems="item.inputFields" />
        <div v-if="item.exists">
          <div class="row mb-2">
            <div class="col-4">
              <label class="font-weight-bold float-right">{{labels.get('label_market_size_total')}}</label>
            </div>
            <div class="col-lg-4 col-8">
              <input type="text" name="item[market_size_total]" class="form-control float_positive" :value="item.data.market_size_total">
            </div>
          </div>
        </div>
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
  fiscal_year:globalVariables.current_year,
  exists:false,
  inputFields:{},
  data:{}
})
const setItemDefaults=async ()=>{
  item.data={
    market_size_total:'',
  }
}
setItemDefaults();
let crops_object={};
for(let i in taskData.crops){
  crops_object[taskData.crops[i]['id']]=taskData.crops[i];
}
let crop_types_object={};
for(let i in taskData.crop_types){
  crop_types_object[taskData.crop_types[i]['id']]=taskData.crop_types[i];
}
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
  key='fiscal_year';
  inputFields[key] = {
    name: 'item[' +key +']',
    label: labels.get('label_'+key),
    type:'dropdown',
    options:new Array(globalVariables.current_fiscal_year-globalVariables.starting_year+1).fill().map((temp,index) => {return {value:globalVariables.current_fiscal_year-index,label:(globalVariables.current_fiscal_year-index)+' - '+(globalVariables.current_fiscal_year-index+1)}}),
    default:globalVariables.current_fiscal_year,
    mandatory:true,
    noselect:true,
  };
  key='part_id';
  inputFields[key] = {
    name: key,
    label: labels.get('label_'+key),
    type:'dropdown',
    options:taskData.location_parts.filter((temp)=>{ if(temp.status=='Active'){temp.value=temp.id.toString();temp.label=temp.name;return true}}),
    default:'',
    mandatory:false
  };
  if(taskData.user_locations.part_id>0){
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
      mandatory:false
    };
  }
  key='area_id';
  inputFields[key] = {
    name: key,
    label: labels.get('label_'+key),
    type:'dropdown',
    options:(taskData.user_locations.part_id>0)?taskData.location_areas.filter((temp)=>{ if((temp.part_id==taskData.user_locations.part_id)&&(temp.status=='Active')){temp.value=temp.id.toString();temp.label=temp.name;return true}}):[],
    default:'',
    mandatory:false
  };
  if(taskData.user_locations.area_id>0){
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
      mandatory:false
    };
  }
  key='territory_id';
  inputFields[key] = {
    name: 'item[' +key +']',
    label: labels.get('label_'+key),
    type:'dropdown',
    options:(taskData.user_locations.area_id>0)?taskData.location_territories.filter((temp)=>{ if((temp.area_id==taskData.user_locations.area_id) && (temp.status=='Active')){temp.value=temp.id.toString();temp.label=temp.name;return true}}):[],
    default:'',
    mandatory:false
  };
  if(taskData.user_locations.territory_id>0){
    inputFields[key] = {
      name: 'item[' +key +']',
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
      mandatory:false
    };
  }
  key='crop_id';
  inputFields[key] = {
    name: 'crop_id',
    label: labels.get('label_'+key),
    type:'dropdown',
    options:taskData.crops.map((temp)=>{ return {value:temp.id,label:temp.name}}),
    default:'',
    mandatory:true
  };
  key='type_id';
  inputFields[key] = {
    name: 'item[' +key +']',
    label: labels.get('label_'+key),
    type:'dropdown',
    options:[],
    default:'',
    mandatory:true
  };
  item.inputFields=inputFields;

}
setInputFields();
$(document).ready(async function()
{
  $(document).off("change", "#crop_id");
  $(document).on("change",'#crop_id',async function()
  {
    let crop_id=$(this).val();
    let key='type_id';
    item.inputFields[key].options=taskData.crop_types.filter((temp)=>{ if((temp.crop_id==crop_id) && (temp.status=='Active')){temp.value=temp.id.toString();temp.label=temp.name;return true}})
    await systemFunctions.delay(1);
    $('#'+key).val('');
    item.exists=false;
  })
  $(document).off("change", "#type_id");
  $(document).on("change",'#type_id',async function()
  {
    let type_id=$(this).val();
    getItem();
  })
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
    item.exists=false;
  })
  $(document).off("change", "#area_id");
  $(document).on("change",'#area_id',async function()
  {
    let area_id=$(this).val();
    let key='territory_id';
    item.inputFields[key].options=taskData.location_territories.filter((temp)=>{ if((temp.area_id==area_id)&& (temp.status=='Active')){temp.value=temp.id.toString();temp.label=temp.name;return true}})
    await systemFunctions.delay(1);
    $('#'+key).val('');
    item.exists=false;
  })
  $(document).off("change", "#territory_id");
  $(document).on("change",'#territory_id',async function()
  {
    getItem()
  })
  $(document).off("change", "#fiscal_year");
  $(document).on("change",'#fiscal_year',async function()
  {
    item.fiscal_year=(+$(this).val());
    getItem()
  })
});
const getItem=async ()=>{
  let formData=new FormData(document.getElementById('formSaveItem'))
  item.exists=false;
  if(($('#type_id').val()>0)&&($('#territory_id').val()>0)&&($('#fiscal_year').val()>0)){
    await axios.post(taskData.api_url+'/get-item/0',formData).then((res)=>{
      if (res.data.error == "") {
        if(res.data.item){
          item.data=res.data.item;
        }
        else{
          setItemDefaults();
        }
        item.sales=res.data.sales;
        item.exists=true;
      }
      else{
        toastFunctions.showResponseError(res.data)
      }
    });
  }

}
const save=async (save_and_new)=>{
  let formData=new FormData(document.getElementById('formSaveItem'))
  await axios.post(taskData.api_url+'/save-item',formData).then((res)=>{
    if (res.data.error == "") {
      globalVariables.loadListData=true;
      toastFunctions.showSuccessfullySavedMessage();
      item.exists=false;
      $('#type_id').val('');
      $('#save_token').val(new Date().getTime());

    }
    else{
      toastFunctions.showResponseError(res.data)
    }
  });

}

</script>
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
          <div class="row mb-2">
            <div class="col-4">
              <label class="font-weight-bold float-right">{{labels.get('label_pocket_market')}}</label>
            </div>
            <div class="col-lg-4 col-8">
              <input type="text" name="item[pocket_market]" class="form-control" :value="item.data.pocket_market">
            </div>
          </div>
          <div class="row mb-2">
            <div class="col-4">

            </div>
            <div class="col-8">
              <table class="table table-bordered">
                <thead>
                <tr>
                  <th>Major Competitor Variety</th>
                  <th></th>
                </tr>
                </thead>
                <tbody>
                <tr>
                  <td>
                    <select id="competitor_variety_major" class="form-control">
                      <option value="0">{{labels.get('label_select')}}</option>
                      <option v-for="row in item.inputFields2.varieties_competitor" :value="row.id">
                        {{row.name}}
                      </option>
                    </select>
                  </td>
                  <td><button type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-primary btn_add_more_competitor_variety_major"><i class="bi bi-plus-circle"></i> {{labels.get('action_1')}}</button></td>
                </tr>
                <tr v-for="(competitor_data,comp_variety_id) in item.data.competitor_varieties">
                  <td>
                    <div class="row mb-2">
                      <div class="col-3">Why Recommended {{varieties_object[comp_variety_id]?varieties_object[comp_variety_id].name:'NF'}}</div>
                      <div class="col-9"><textarea class="form-control" :name="'item[competitor_varieties]['+comp_variety_id+'][reason_competitor_variety]'">{{competitor_data['reason_competitor_variety']}}</textarea></div>
                    </div>
                  </td>
                  <td><button type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-danger btn_remove_competitor_variety_major"><i class="bi bi-dash-circle"></i> Remove </button></td>
                </tr>
                </tbody>
              </table>
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
  exists:false,
  fiscal_year:globalVariables.current_year,
  season_id:'',
  inputFields:{},
  inputFields2:{varieties_arm:[],varieties_competitor:[]},
  data:{}
})
let varieties_object={};
for(let i in taskData.varieties){
  varieties_object[taskData.varieties[i]['id']]=taskData.varieties[i];
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
const setItemDefaults=async ()=>{
  item.data={
    market_size_total:'',
    pocket_market:'',
    competitor_varieties: {},
    arm_varieties: {},
  }
}
setItemDefaults();

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
  key='season_id';
  inputFields[key] = {
    name: 'item[' +key +']',
    label: labels.get('label_'+key),
    type:'dropdown',
    options:taskData.seasons.filter((temp)=>{ if(temp.status=='Active'){temp.value=temp.id.toString();temp.label=temp.name;if(temp['month_'+globalVariables.current_month]==1){item.season_id=temp.id};return true}}),
    default:item[key],
    mandatory:false
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
const getItem=async ()=>{
  let formData=new FormData(document.getElementById('formSaveItem'))
  item.exists=false;
  if(($('#type_id').val()>0)&&($('#territory_id').val()>0)&&($('#fiscal_year').val()>0)&&($('#season_id').val()>0)){
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

$(document).ready(async function()
{
  $('#variety_id').select2();
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
    item.inputFields2['varieties_arm']=taskData.varieties.filter((temp)=>{ if(temp.crop_type_id==type_id && temp.whose=='ARM' && (temp.status=='Active')){temp.value=temp.id.toString();temp.label=temp.name;return true}})
    item.inputFields2['varieties_competitor']=taskData.varieties.filter((temp)=>{ if(temp.crop_type_id==type_id && temp.whose=='Competitor' && (temp.status=='Active')){temp.value=temp.id.toString();temp.label=temp.name;return true}})
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
    getItem()
  })
  $(document).off("change", "#season_id");
  $(document).on("change",'#season_id',async function()
  {
    getItem()
  })
  $(document).off("click", ".btn_add_more_competitor_variety_major");
  $(document).on("click",'.btn_add_more_competitor_variety_major',function()
  {
    let competitor_variety_id=$('#competitor_variety_major').val();
    if(competitor_variety_id>0){
      let competitor_variety_name=varieties_object[competitor_variety_id]?varieties_object[competitor_variety_id].name:'NF';
        let html='<tr>';
        html+='<td>';
        html+='<div class="row mb-2"><div class="col-3">Why Recommended '+competitor_variety_name+'</div><div class="col-9"><textarea class="form-control" name="item[competitor_varieties]['+competitor_variety_id+'][reason_competitor_variety]"></textarea></div> </div>';

        html+='</td>'
        html+='<td><button type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-danger btn_remove_competitor_variety_major"><i class="bi bi-dash-circle"></i> Remove </button>';
        html+='</tr>';
        $(this).closest("tr").after(html);
      }
    $('#competitor_variety_major').val(0);
  })
  $(document).off("click", ".btn_remove_competitor_variety_major");
  $(document).on("click",'.btn_remove_competitor_variety_major',function(){
    $(this).closest('tr').remove();
  });
});
</script>
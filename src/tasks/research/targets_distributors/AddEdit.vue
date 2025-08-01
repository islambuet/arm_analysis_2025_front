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
    <div class="card-body">
      <form id="formSaveItem">
        <input type="hidden" name="save_token" id="save_token" :value="new Date().getTime()">
        <input type="hidden" name="item[distributor_id]" :value="item.id">
        <input type="hidden" name="item[fiscal_year]" :value="current_fiscal_year">
        <div class="row mb-2">
          <div class="col-4">
            <label class="font-weight-bold float-right">{{labels.get('label_fiscal_year')}}</label>
          </div>
          <div class="col-lg-4 col-8">
            <label class="font-weight-bold">{{current_fiscal_year+'-'+(current_fiscal_year+1)}} </label>
          </div>
        </div>
        <div class="row mb-2">
          <div class="col-4">
            <label class="font-weight-bold float-right">{{labels.get('label_crop_name')}} <span class="text-danger">*</span></label>
          </div>
          <div class="col-lg-4 col-8">
            <div class="input-group" >
              <select id="crop_id" class="form-control">
                <option value="">{{labels.get('label_select')}}</option>
                <option v-for="row in taskData.crops" :value="row.id">
                  {{row.name}}
                </option>
              </select>
            </div>
          </div>
        </div>
        <div class="row mb-2">
          <div class="col-4">
            <label class="font-weight-bold float-right">{{labels.get('label_crop_type_name')}} <span class="text-danger">*</span></label>
          </div>
          <div class="col-lg-4 col-8">
            <div class="input-group" >
              <select id="type_id" name="item[type_id]" class="form-control">
                <option value="">{{labels.get('label_select')}}</option>
                <option v-for="row in item.inputFields.crop_types" :value="row.id">
                  {{row.name}}
                </option>
              </select>
            </div>
          </div>
        </div>
        <div v-if="item.exists">
          <div class="row mb-2">
            <div class="col-4">
              <label class="font-weight-bold float-right">{{labels.get('label_month_start')}}</label>
            </div>
            <div class="col-lg-4 col-8">
              <select id="month_start" name="item[month_start]" class="form-control" v-model="item.data.month_start">
                <option value="0">{{labels.get('label_select')}}</option>
                <option v-for="i in 12" :value="i">
                  {{labels.get('label_month_short_'+i)}}
                </option>
              </select>
            </div>
          </div>
          <div class="row mb-2">
            <div class="col-4">
              <label class="font-weight-bold float-right">{{labels.get('label_month_end')}}</label>
            </div>
            <div class="col-lg-4 col-8">
              <select id="month_end" name="item[month_end]" class="form-control" v-model="item.data.month_end">
                <option value="0">{{labels.get('label_select')}}</option>
                <option v-for="i in 12" :value="i">
                  {{labels.get('label_month_short_'+i)}}
                </option>
              </select>
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
                  <th>Proposed ARM Variety</th>
                  <th></th>
                </tr>
                </thead>
                <tbody>
                <tr>
                  <td>
                    <select id="competitor_variety_major" class="form-control">
                      <option value="0">{{labels.get('label_select')}}</option>
                      <option v-for="row in item.inputFields.varieties_competitor" :value="row.id">
                        {{row.name}}
                      </option>
                    </select>
                  </td>
                  <td>
                    <template v-for="row in item.inputFields.varieties_arm">
                      <input type="checkbox" class="arm_variety_proposed" :value="row.id"> {{row.name}} &nbsp;<br>
                    </template>
                  </td>
                  <td><button type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-primary btn_add_more_competitor_variety_major"><i class="bi bi-plus-circle"></i> {{labels.get('action_1')}}</button></td>
                </tr>
                <tr v-for="(arm_variety_ids,comp_variety_id) in item.data.competitor_variety_major">
                  <td>{{varieties_object[comp_variety_id]?varieties_object[comp_variety_id].name:'NF'}}</td>
                  <td>
                    <template v-for="arm_variety_id in arm_variety_ids">
                      {{(varieties_object[arm_variety_id]?varieties_object[arm_variety_id].name:'NF')}}<br>
                    </template>
                  </td>
                  <td>
                    <input type="hidden" name="item[competitor_variety_major][]" :value="comp_variety_id+',_'+arm_variety_ids.join('_')+'_'">
                    <button type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-danger btn_remove_competitor_variety_major"><i class="bi bi-dash-circle"></i> Remove </button>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="row mb-2">
            <div class="col-4">
              <label class="font-weight-bold float-right">{{labels.get('label_distributor_recommendation')}}</label>
            </div>
            <div class="col-lg-4 col-8">
              <textarea class="form-control" name="item[distributor_recommendation]">{{item.data.distributor_recommendation}}</textarea>
            </div>
          </div>
          <div class="row mb-2">
            <div class="col-4">
              <label class="font-weight-bold float-right">{{labels.get('label_manager_recommendation')}}</label>
            </div>
            <div class="col-lg-4 col-8">
              <textarea class="form-control" name="item[manager_recommendation]">{{item.data.manager_recommendation}}</textarea>
            </div>
          </div>
          <div class="row mb-2">
            <div class="col-4">
              <label class="font-weight-bold float-right">{{labels.get('label_manager_suggestion')}}</label>
            </div>
            <div class="col-lg-4 col-8">
              <textarea class="form-control" name="item[manager_suggestion]">{{item.data.manager_suggestion}}</textarea>
            </div>
          </div>
          <table class="table table-bordered">
            <thead>
            <tr>
              <th></th>
              <th v-for="row in item.inputFields.varieties_arm">
                {{row.name}}
              </th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <td>Sales FY-{{(current_fiscal_year-2)+'-'+(current_fiscal_year-1)}}</td>
              <td v-for="row in item.inputFields.varieties_arm">
                {{item.sales['year_2'] && item.sales['year_2'][row.id] ?item.sales['year_2'][row.id]['quantity'].toFixed(3):''}}
              </td>
            </tr>
            <tr>
              <td>Sales FY-{{(current_fiscal_year-1)+'-'+(current_fiscal_year)}}</td>
              <td v-for="row in item.inputFields.varieties_arm">
                {{item.sales['year_1'] && item.sales['year_1'][row.id] ?item.sales['year_1'][row.id]['quantity'].toFixed(3):''}}
              </td>
            </tr>
            <template v-for="i in 3">
              <tr>
                <td :colspan="item.inputFields.varieties_arm.length+1" class="text-center"><strong>Sales Activities For FY-{{(current_fiscal_year+i-1)+'-'+(current_fiscal_year+i)}}</strong></td>
              </tr>
              <tr v-for="key in ['forecast','dealer_meeting','farmer_meeting','num_demo','num_result_sharing','num_field_day']">
                <td>{{labels.get('label_'+key)}}</td>
                <td v-for="row in item.inputFields.varieties_arm">
                  <input type="text" :name="'item['+key+']['+(i-1)+']['+row.id+']'" class="form-control float_positive" :value="item['data'][key][i-1]&&item['data'][key][i-1][row.id]?item['data'][key][i-1][row.id]:''">
                </td>
              </tr>
            </template>
            </tbody>
          </table>
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
let current_month=new Date().getMonth();
let current_fiscal_year= (globalVariables.current_year);
if(current_month<globalVariables.fiscal_year_starting_month){
  current_fiscal_year--;
}
let varieties_object={};
for(let i in taskData.varieties){
  varieties_object[taskData.varieties[i]['id']]=taskData.varieties[i];
}
let item=reactive({
  id:0,
  exists:false,
  inputFields:{crop_types:[],varieties_arm:[],varieties_competitor:[]},
  data:{},
  sales:{},
})
const setItemDefaults=async ()=>{
  item.data={
    month_start:0,
    month_end:0,
    pocket_market:'',
    competitor_variety_major: {},
    distributor_recommendation:'',
    manager_recommendation:'',
    manager_suggestion:'',
    forecast:{},
    dealer_meeting:{},
    farmer_meeting:{},
    num_demo:{},
    num_result_sharing:{},
    num_field_day:{},
  }
}
setItemDefaults();
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
  let formData=new FormData(document.getElementById('formSaveItem'))
  item.exists=false;
  if($('#type_id').val()>0){
    await axios.post(taskData.api_url+'/get-item/'+ item.id,formData).then((res)=>{
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
  item.id=route.params['item_id']?route.params['item_id']:0;

$(document).ready(function()
{

  $(document).off("change", "#crop_id");
  $(document).on("change",'#crop_id',async function()
  {
    item.exists=false;
    let crop_id=$(this).val();
    item.inputFields['crop_types']=taskData.crop_types.filter((temp)=>{ if(temp.crop_id==crop_id){temp.value=temp.id.toString();temp.label=temp.name;return true}})
    await systemFunctions.delay(1);
    $('#type_id').val('');
  })
  $(document).off("change", "#type_id");
  $(document).on("change",'#type_id',async function()
  {
    let type_id=$(this).val();
    item.inputFields['varieties_arm']=taskData.varieties.filter((temp)=>{ if(temp.crop_type_id==type_id && temp.whose=='ARM'){temp.value=temp.id.toString();temp.label=temp.name;return true}})
    item.inputFields['varieties_competitor']=taskData.varieties.filter((temp)=>{ if(temp.crop_type_id==type_id && temp.whose=='Competitor'){temp.value=temp.id.toString();temp.label=temp.name;return true}})
    getItem();
  })
  $(document).off("click", ".btn_add_more_competitor_variety_major");
  $(document).on("click",'.btn_add_more_competitor_variety_major',function()
  {
    let competitor_variety_major=$('#competitor_variety_major').val();
    if(competitor_variety_major>0){
      let competitor_name=varieties_object[competitor_variety_major]?varieties_object[competitor_variety_major].name:'NF';

      let arm_names='';
      let arm_ids='_';
      $('.arm_variety_proposed').each(function() {
        if($(this).is(':checked')){
          let arm_variety_id=$(this).val();
          arm_ids+=(arm_variety_id+'_');
          arm_names+=((varieties_object[arm_variety_id]?varieties_object[arm_variety_id].name:'NF')+'</br>')
        }

      });
      if(arm_ids.length>1){
        let html='<tr>';
        html+=('<td>'+competitor_name+'</td>');
        html+=('<td>'+arm_names+'</td>');
        html+='<td><button type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-danger btn_remove_competitor_variety_major"><i class="bi bi-dash-circle"></i> Remove </button>';
        html+=('<input type="hidden" name="item[competitor_variety_major][]" value="'+(competitor_variety_major+','+arm_ids)+'"></td>');
        html+='</tr>';
        $(this).closest("tr").after(html);
      }
    }

  })
  $(document).off("click", ".btn_remove_competitor_variety_major");
  $(document).on("click",'.btn_remove_competitor_variety_major',function(){
    let row_type_id=$(this).closest('.row_type').attr('id');
    $(this).closest('tr').remove();
  });
});
</script>
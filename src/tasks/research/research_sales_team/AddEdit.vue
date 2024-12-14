<template>
  <div class="card d-print-none mb-2">
    <div class="card-body">
      <router-link :to="taskData.api_url" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" ><i class="feather icon-corner-up-left"></i> {{labels.get('label_back')}}</router-link>
      <template v-if="item.exists">
        <button  type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" @click="save(false)"><i class="feather icon-save"></i> {{labels.get('label_save')}}</button>
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
        <InputTemplate v-if="item.showInputFields2" :inputItems="item.inputFields2" />
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
  showInputFields2:false,
  inputFields:{},
  inputFields2:{},
  data:{
    id:0,
    name:'',
    crop_id:'',
    crop_type2_id:'',
    part_id:taskData.user_locations.part_id,
    area_id:taskData.user_locations.area_id,
    territory_id:taskData.user_locations.territory_id,
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
  if(item.data.part_id>0){
    key='part_id';
    let defaultElem=taskData.location_parts.find((elem)=>{ if(elem.id==item.data.part_id){return elem;}});
    inputFields[key] = {
      name: key,
      label: labels.get('label_'+key),
      type:'textonly',
      default:defaultElem?defaultElem.name:labels.get('msg_invalid_data'),
      mandatory:true
    };
    if(item.data.area_id>0){
      key='area_id';
      let defaultElem=taskData.location_areas.find((elem)=>{ if(elem.id==item.data.area_id){return elem;}});
      inputFields[key] = {
        name: key,
        label: labels.get('label_'+key),
        type:'textonly',
        default:defaultElem?defaultElem.name:labels.get('msg_invalid_data'),
        mandatory:true
      };
      if(item.data.territory_id>0){
        key='territory_name';
        let defaultElem=taskData.location_territories.find((elem)=>{ if(elem.id==item.data.territory_id){return elem;}});
        inputFields[key] = {
          name: key,
          label: labels.get('label_'+key),
          type:'textonly',
          default:defaultElem?defaultElem.name:labels.get('msg_invalid_data'),
          mandatory:true
        };
        key='territory_id';
        inputFields[key] = {
          name: 'item[' +key +']',
          label: labels.get('label_'+key),
          type:'hidden',
          default:item.data.territory_id,
          mandatory:true
        };

      }
      else{
        key='territory_id';
        inputFields[key] = {
          name: 'item[' +key +']',
          label: labels.get('label_'+key),
          type:'dropdown',
          options:taskData.location_territories.filter((elem)=>{ if(elem.area_id==item.data.area_id){elem.value=elem.id.toString();elem.label=elem.name;return true}}),
          default:item.data[key],
          mandatory:true
        };
      }

    }
    else{
      key='area_id';
      inputFields[key] = {
        name: key,
        label: labels.get('label_'+key),
        type:'dropdown',
        options:taskData.location_areas.filter((elem)=>{ if(elem.part_id==item.data.part_id){elem.value=elem.id.toString();elem.label=elem.name;return true}}),
        default:item.data[key],
        mandatory:true
      };
      key='territory_id';
      inputFields[key] = {
        name: 'item[' +key +']',
        label: labels.get('label_'+key),
        type:'dropdown',
        options:[],
        default:item.data[key],
        mandatory:true
      };
    }
  }
  else{
    key='part_id';
    inputFields[key] = {
      name: key,
      label: labels.get('label_'+key),
      type:'dropdown',
      options:taskData.location_parts.map((elem)=>{ return {value:elem.id,label:elem.name}}),
      default:item.data[key],
      mandatory:true
    };
    key='area_id';
    inputFields[key] = {
      name: key,
      label: labels.get('label_'+key),
      type:'dropdown',
      options:[],
      default:item.data[key],
      mandatory:true
    };
    key='territory_id';
    inputFields[key] = {
      name: 'item[' +key +']',
      label: labels.get('label_'+key),
      type:'dropdown',
      options:[],
      default:item.data[key],
      mandatory:true
    };

  }

  key='crop_id';
  inputFields[key] = {
    name: 'crop_id',
    label: labels.get('label_'+key),
    type:'dropdown',
    options:taskData.crops.map((elem)=>{ return {value:elem.id,label:elem.name}}),
    default:item.data[key],
    mandatory:true
  };
  key='crop_type2_id';
  inputFields[key] = {
    name: 'item[' +key +']',
    label: labels.get('label_'+key),
    type:'dropdown',
    options:[],
    default:item.data[key],
    mandatory:true
  };
  item.inputFields=inputFields;
}
const setInputFields2=async (itemData,competitorVarieties)=>{
  item.inputFields2= {};
  await systemFunctions.delay(1);
  let inputFields2={}

  let key='market_size';
  inputFields2[key] = {
    name: 'item[' +key +']',
    label: labels.get('label_'+key),
    type:'text',
    default:itemData?itemData[key]:'',
    class:'float_positive',
    mandatory:false
  };
  key='sowing_periods';
  inputFields2[key] = {
    name: 'item[' +key +']',
    label: labels.get('label_'+key),
    type:'checkbox',
    options:Array.from({length: 12}, (elem,index) => { return {'value':index+1+'','label':labels.get('label_month_short_'+(index+1))}}),
    default:itemData?itemData[key].split(','):[],
    mandatory:false,
    inline:true
  };
  key='competitor_varieties_ids';
  inputFields2[key] = {
    name: 'item[' +key +']',
    label: labels.get('label_'+key),
    type:'checkbox',
    options:competitorVarieties?competitorVarieties.map((elem)=>{ return {value:elem.id+'',label:elem.name}}):[],
    default:itemData?itemData[key].split(','):[],
    mandatory:false,
    inline:false
  };
  key='reason_sales';
  inputFields2[key] = {
    name: 'item[' +key +']',
    label: labels.get('label_'+key),
    type:'textarea',
    default:itemData?itemData[key]:'',
    mandatory:false
  };
  item.inputFields2=inputFields2;
}
$(document).ready(function()
{
  $(document).off("change", "#crop_id");
  $(document).on("change",'#crop_id',function()
  {
    let crop_id=$(this).val();
    let key='crop_type2_id';
    item.inputFields[key].options=taskData.crop_types2.filter((item)=>{ if(item.crop_id==crop_id){item.value=item.id.toString();item.label=item.name;return true}})
    $('#'+key).val('');
    getItem();
  })
  $(document).off("change", "#part_id");
  $(document).on("change",'#part_id',function()
  {
    let part_id=$(this).val();
    let key='area_id';
    item.inputFields[key].options=taskData.location_areas.filter((item)=>{ if(item.part_id==part_id){item.value=item.id.toString();item.label=item.name;return true}})
    $('#'+key).val('');
    key='territory_id';
    item.inputFields[key].options=[];
    $('#'+key).val('');
    getItem();
  })
  $(document).off("change", "#area_id");
  $(document).on("change",'#area_id',function()
  {
    let area_id=$(this).val();
    let key='territory_id';
    item.inputFields[key].options=taskData.location_territories.filter((item)=>{ if(item.area_id==area_id){item.value=item.id.toString();item.label=item.name;return true}})
    $('#'+key).val('');
    getItem();
  })
  $(document).off("change", "#territory_id");
  $(document).off("change", "#crop_type2_id");
  $(document).on("change",'#territory_id,#crop_type2_id',function()
  {
    getItem();
  })
});
const getItem=async ()=>{
  item.showInputFields2=false;
  await systemFunctions.delay(1);
  let territory_id=$('input[name="item[territory_id]"]').val();
  let crop_type2_id=$('#crop_type2_id').val();
  if(territory_id>0 && crop_type2_id>0){

    await axios.get(taskData.api_url+'/get-item-by-croptype2_id-territory_id/'+crop_type2_id+'/'+territory_id).then((res)=>{
      if (res.data.error == "") {
        setInputFields2(res.data.item,res.data.competitor_varieties);
        item.showInputFields2=true;
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
      router.push(taskData.api_url)
    }
    else{
      toastFunctions.showResponseError(res.data)
    }
  });

}
      setInputFields();
      item.exists=true;

</script>
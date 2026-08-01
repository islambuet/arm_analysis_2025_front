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
    <div class="card-header d-print-none">
      {{labels.get('label_task')}}
    </div>
    <div class="card-body">
      <form id="formSaveItem">
        <InputTemplate :inputItems="item.inputFields" />
        <div class="row mb-2" v-show="item.exists">
          <div class="col-4">
          </div>
          <div class="col-8">
            <table id="table_varieties" class="table table-bordered">
              <thead>
              <tr>
                <th>Crop</th>
                <th>Type</th>
                <th>Variety</th>
                <th>Product</th>
                <th style="width: 100px;">Quantity (pkt) </th>
                <th style="width: 100px">Quantity (Kg) </th>
                <th></th>
              </tr>
              </thead>
              <tbody>

              <tr v-for="(quantity,pack_size_id) in item.data.pack_sizes" v-if="item.exists">
                <td>{{pack_sizes_object[pack_size_id]?pack_sizes_object[pack_size_id].crop_name:'NF'}}</td>
                <td>{{pack_sizes_object[pack_size_id]?pack_sizes_object[pack_size_id].type_name:'NF'}}</td>
                <td>{{pack_sizes_object[pack_size_id]?pack_sizes_object[pack_size_id].variety_name:'NF'}}</td>
                <td>{{pack_sizes_object[pack_size_id]?pack_sizes_object[pack_size_id].name:'NF'}}</td>
                <td><input type="text" :data-value="pack_sizes_object[pack_size_id]?pack_sizes_object[pack_size_id].value:'0'" class="form-control integer_positive quantity_pkt" :name="'item[pack_sizes]['+pack_size_id+']'" :value="quantity"></td>
                <td  class="quantity_kg text-right">{{pack_sizes_object[pack_size_id]?((+pack_sizes_object[pack_size_id].value)*(+quantity)/1000):'0'}}</td>
                <td><button type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-danger btn_remove_pack_size"><i class="bi bi-dash-circle"></i> Remove </button></td>
              </tr>
              <tr>
                <td colspan="4">
                  <select id="pack_size_id" class="form-control">
                    <option value="">{{labels.get('label_select')}}</option>
                    <template v-for="row in taskData.pack_sizes">
                      <option  :value="row.id" v-if="row.status=='Active'">
                        {{row.name}}
                      </option>
                    </template>

                  </select>
                </td>
                <td><input type="text" class="form-control float_positive" id="quantity_pkt" value=""></td>
                <td></td>
                <td><button type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-primary btn_add_more_pack_size"><i class="bi bi-plus-circle"></i> {{labels.get('action_1')}}</button></td>
              </tr>
              </tbody>
            </table>
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
  status:"Pending",
  inputFields:{},
  inputFields2:{crop_types:[],varieties:[]},
  data:{
    pack_sizes:{},
  }
})
let crops_object={};
for(let i in taskData.crops){
  crops_object[taskData.crops[i]['id']]=taskData.crops[i];
}
let crop_types_object={};
for(let i in taskData.crop_types){
  crop_types_object[taskData.crop_types[i]['id']]=taskData.crop_types[i];
}
let varieties_object={};
for(let i in taskData.varieties){
  varieties_object[taskData.varieties[i]['id']]=taskData.varieties[i];
}
let pack_sizes_object={};
for(let i in taskData.pack_sizes){
  pack_sizes_object[taskData.pack_sizes[i]['id']]=taskData.pack_sizes[i];
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

  key='sales_return_at';
  if(taskData.permissions.action_3){
    inputFields[key] = {
      name: 'item[' +key +']',
      label: labels.get('label_'+key),
      type:'datetime-local',
      default:moment().format('YYYY-MM-DDTHH:mm'),
      mandatory:true
    };
  }
  else{
    inputFields[key] = {
      name: 'item[' +key +']',
      label: labels.get('label_'+key),
      type:'hidden',
      default:moment().format('YYYY-MM-DDTHH:mm'),
      mandatory:true
    };
  }

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
    name: key,
    label: labels.get('label_'+key),
    type:'dropdown',
    options:(taskData.user_locations.area_id>0)?taskData.location_territories.filter((temp)=>{ if((temp.area_id==taskData.user_locations.area_id) && (temp.status=='Active')){temp.value=temp.id.toString();temp.label=temp.name;return true}}):[],
    default:'',
    mandatory:false
  };
  if(taskData.user_locations.territory_id>0){
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
      mandatory:false
    };
  }
  key='distributor_id';
  inputFields[key] = {
    name: key,
    label: labels.get('label_'+key),
    type:'dropdown',
    options:(taskData.user_locations.territory_id>0)?taskData.distributors.filter((temp)=>{ if((temp.territory_id==taskData.user_locations.territory_id) && (temp.status=='Active')){temp.value=temp.id.toString();temp.label=temp.name;return true}}):[],
    default:'',
    mandatory:false
  };
  key='dealer_id';
  inputFields[key] = {
    name: 'item[' +key +']',
    label: labels.get('label_'+key),
    type:'dropdown',
    options:[],
    default:'',
    mandatory:false
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
  item.exists=false;
  $('#table_varieties tbody tr:not(:last)').remove();
  if($('#distributor_id').val()>0){
    await systemFunctions.delay(1);
    let formData=new FormData(document.getElementById('formSaveItem'))
    await axios.post(taskData.api_url+'/get-item/0',formData).then((res)=>{
      if (res.data.error == "") {
        if(res.data.item.pack_sizes){
          item.data.pack_sizes=res.data.item.pack_sizes;
          item.status=res.data.item.status;
        }
        else{
          item.data.pack_sizes={}
          item.status='Pending';
        }

        item.exists=true;
      }
      else{
        toastFunctions.showResponseError(res.data)
      }
    });

  }

}
setInputFields();

$(document).ready(async function()
{
  $('#pack_size_id').select2();
  $(document).off("change", "#crop_id");
  $(document).on("change",'#crop_id',async function()
  {
    let crop_id=$(this).val();
    item.inputFields2['crop_types']=taskData.crop_types.filter((temp)=>{ if((temp.crop_id==crop_id) && (temp.status=='Active')){temp.value=temp.id.toString();temp.label=temp.name;return true}})
    await systemFunctions.delay(1);
    $('#type_id').val('');
    item.inputFields2['varieties']=[]
    $('#variety_id').val('');
  })
  $(document).off("change", "#type_id");
  $(document).on("change",'#type_id',async function()
  {
    let type_id=$(this).val();
    item.inputFields2['varieties']=taskData.varieties.filter((temp)=>{ if((temp.crop_type_id==type_id) && (temp.status=='Active')){temp.value=temp.id.toString();temp.label=temp.name;return true}})
    await systemFunctions.delay(1);
    $('#variety_id').val('');
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
    key='distributor_id';
    item.inputFields[key].options=[];
    $('#'+key).val('');
    key='dealer_id';
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
    key='distributor_id';
    item.inputFields[key].options=[];
    $('#'+key).val('');
    key='dealer_id';
    item.inputFields[key].options=[];
    $('#'+key).val('');
    item.exists=false;
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
    item.exists=false;
  })
  $(document).off("change", "#distributor_id");
  $(document).on("change",'#distributor_id',async function()
  {
    let distributor_id=$(this).val();
    let key='dealer_id';
    item.inputFields[key].options=taskData.dealers.filter((temp)=>{ if((temp.distributor_id==distributor_id)&& (temp.status=='Active')){temp.value=temp.id.toString();temp.label=temp.name;return true}})
    await systemFunctions.delay(1);
    $('#'+key).val('');
    item.exists=false;
  })
  $(document).off("change", "#dealer_id");
  $(document).on("change",'#dealer_id',async function()
  {
    getItem()
  })
  $(document).off("change", "#fiscal_year");
  $(document).on("change",'#fiscal_year',async function()
  {
    getItem()
  })
  $(document).off("change", "#month");
  $(document).on("change",'#month',async function()
  {
    getItem()
  })
  $(document).off("change", "#sales_at");
  $(document).on("change",'#sales_at',async function()
  {
    getItem()
  })

  $(document).off("click", ".btn_add_more_pack_size");
  $(document).on("click",'.btn_add_more_pack_size',function()
  {
    let pack_size_id=$('#pack_size_id').val();
    if(pack_size_id>0){
      let crop_name='NF';
      let type_name='NF';
      let variety_name='NF';
      let pack_size_name='NF';
      let pack_size_value=0;
      if(pack_sizes_object[pack_size_id]){
        pack_size_name=pack_sizes_object[pack_size_id].name;
        variety_name=pack_sizes_object[pack_size_id].variety_name;
        crop_name=pack_sizes_object[pack_size_id].crop_name;
        type_name=pack_sizes_object[pack_size_id].type_name;
        pack_size_value=pack_sizes_object[pack_size_id].value;
      }
      let html=('<tr><td>'+crop_name+'</td>');
      html+=('<td>'+type_name+'</td>');
      html+=('<td>'+variety_name+'</td>');
      html+=('<td>'+pack_size_name+'</td>');
      html+=('<td><input type="text" data-value="'+pack_size_value+'" class="form-control integer_positive quantity_pkt" name="item[pack_sizes]['+pack_size_id+']" value="'+$('#quantity_pkt').val()+'"></td>');
      html+=('<td class="quantity_kg text-right">'+(+$('#quantity_pkt').val()/1000)*(+pack_size_value)+'</td>');
      html+='<td><button type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-danger btn_remove_pack_size"><i class="bi bi-dash-circle"></i> Remove </button>';
      html+='</tr>';
      $(this).closest("tr").before(html);
    }
    $('#pack_size_id').val('');
    $('#quantity_pkt').val('')
    $('#select2-pack_size_id-container').html(labels.get('label_select'));
    $('#quantity').val('')
  })
  $(document).off("input", ".quantity_pkt");
  $(document).on("input",'.quantity_pkt',function(){
    let quantity=(+$(this).val())
    let pack_size_value=$(this).attr('data-value');
    $(this).parent().siblings('.quantity_kg').html(quantity*pack_size_value/1000)
  });
  $(document).off("click", ".btn_remove_pack_size");
  $(document).on("click",'.btn_remove_pack_size',function(){
    $(this).closest('tr').remove();
  });

});
</script>
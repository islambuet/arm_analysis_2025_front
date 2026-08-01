<template>
  <div class="card d-print-none mb-2">
    <div class="card-body">
      <router-link :to="taskData.api_url" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" ><i class="feather icon-corner-up-left"></i> Go to List</router-link>
      <template v-if="item.exists">
        <button v-if="item.data.status=='Pending'"  type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" @click="save(false)"><i class="feather icon-save"></i> {{labels.get('label_save')}}</button>
        <router-link v-if="item.data.status=='Pending'" :to="taskData.api_url+'/details/'+item.id" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" ><i class="feather icon-camera"></i> Go To View</router-link>
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
  inputFields:{},
  data:{},
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
  key='id';
  inputFields[key] = {
    name: key,
    label: labels.get('label_'+key),
    type:'hidden',
    default:item.data[key],
    mandatory:true
  };

  key='sales_at';
  inputFields[key] = {
    name: 'item[' +key +']',
    label: labels.get('label_'+key),
    type:'textonly',
    default:item.data[key],
    mandatory:true
  };


  key='part_name';
  inputFields[key] = {
    name: key,
    label: labels.get('label_'+key),
    type:'textonly',
    default:item.data[key],
    mandatory:false
  };
  key='area_name';
  inputFields[key] = {
    name: key,
    label: labels.get('label_'+key),
    type:'textonly',
    default:item.data[key],
    mandatory:false
  };
  key='territory_name';
  inputFields[key] = {
    name: key,
    label: labels.get('label_'+key),
    type:'textonly',
    default:item.data[key],
    mandatory:false
  };
  key='distributor_name';
  inputFields[key] = {
    name: key,
    label: labels.get('label_'+key),
    type:'textonly',
    default:item.data[key],
    mandatory:false
  };
  key='dealer_name';
  inputFields[key] = {
    name: key,
    label: labels.get('label_'+key),
    type:'textonly',
    default:item.data[key],
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
      router.push(taskData.api_url+'/details/'+item.id)
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
item.id=route.params['item_id'];
getItem();
$(document).ready(async function()
{
  $('#pack_size_id').select2();


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
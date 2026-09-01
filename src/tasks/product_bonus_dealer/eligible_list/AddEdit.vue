<template>
  <div class="card d-print-none mb-2">
    <div class="card-body">
      <router-link :to="taskData.api_url" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" ><i class="feather icon-corner-up-left"></i> {{labels.get('label_back')}}</router-link>
    </div>
  </div>
  <div class="card mb-2" v-if="item.exists">
    <div id="accordion">
      <div class="card d-print-none">
        <div class="card-header p-1">
          <a class="btn btn-sm" data-toggle="collapse" href="#label_delivery">Delivery</a>
        </div>
        <div id="label_delivery" :class="'collapse'+(item.data.delivery_data['delivery_at']?' ':' show')">
          <form id="formSaveDelivery">
            <div class="card-body">
              <InputTemplate :inputItems="item.inputFields" />
              <div class="row mb-2">
                <div class="col-4"><label class="font-weight-bold float-right">Total Delivery Quantity (Kg)</label></div>
                <div class="col-lg-4 col-8"><label id="total_delivery_quantity_kg" class="text-muted"></label></div>
              </div>
              <div class="row mb-2">
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

                    <tr v-for="(quantity,pack_size_id) in item.data.delivery_data.pack_sizes" v-if="item.exists">
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
              <div class="row mb-2">
                <div class="col-4">
                </div>
                <div class="col-4">
                  <button type="button" v-if="!item.data.delivery_data['delivery_at']" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" @click="save()"><i class="feather icon-save"></i> {{labels.get('label_save')}}</button>
                  <button type="button" v-if="taskData.permissions.action_3 && item.data.delivery_data['delivery_at']" class="mr-2 mb-2 btn btn-sm bg-gradient-danger" @click="cancelDelivery()"><i class="feather icon-delete"></i> {{labels.get('action_3')}}</button>
                </div>
                <div class="col-4">
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
      <div class="card" v-if="item.data.delivery_data['delivery_at']">
        <div class="card-header d-print-none p-1">
          <a class="btn btn-sm" data-toggle="collapse" href="#label_challan">Challan</a>
        </div>
        <div id="label_challan" :class="'collapse'+(item.data.delivery_data['delivery_at']?' show':'')">
          <div class="d-flex justify-content-center">
              <!-- <div style="width: 740px;height: 1050px;border: 1px solid red"> -->
              <div style="width: 740px;height: 1000px;">
<!--                header image-->
                <div class="row mb-2">
                  <div class="col-sm-12">
                    <img style="width: 100%;" v-bind:src="globalVariables.baseUrl+'theme/images/challan_top.png'" alt="">
                  </div>
                </div>
<!--                contact info-->
                <div class="row mb-2">
                  <div class="col-sm-12">
                    <div class="border" style="border-color: black !important;">
                      <div class="row">
                        <div class="col-sm-6">
                          <div class="row mb-2">
                            <div class="col-sm-6">
                              Name<span class="float-right">:</span>
                            </div>
                            <div class="col-sm-6">
                              {{item.dealer.name}}
                            </div>
                          </div>
                          <div class="row mb-2">
                            <div class="col-sm-6">
                              Address<span class="float-right">:</span>
                            </div>
                            <div class="col-sm-6">
                              {{item.dealer.address}}
                            </div>
                          </div>
                          <div class="row mb-2">
                            <div class="col-sm-6">
                              Contact No<span class="float-right">:</span>
                            </div>
                            <div class="col-sm-6">
                              {{item.dealer.mobile_no}}
                            </div>
                          </div>
                        </div>
                        <div class="col-sm-6">
                          <div class="row mb-2">
                            <div class="col-sm-6">
                              Challan Number<span class="float-right">:</span>
                            </div>
                            <div class="col-sm-6">
                              {{item.id}}
                            </div>
                          </div>
                          <div class="row mb-2">
                            <div class="col-sm-6">
                              Delivery Date<span class="float-right">:</span>
                            </div>
                            <div class="col-sm-6">
                              {{systemFunctions.displayDate(item.data.delivery_data['delivery_at'])}}
                            </div>
                          </div>
                          <div class="row mb-2">
                            <div class="col-sm-6">
                              Courier Name<span class="float-right">:</span>
                            </div>
                            <div class="col-sm-6">
                              {{taskData.couriers.find(t=>t.id==item.data.delivery_data['courier_id'])?.name}}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
<!--                product info-->
                <div class="row mb-2">
                  <div class="col-12">
                    <table class="table table-bordered">
                      <thead>
                      <tr>
                        <th>Crop</th>
                        <th>Type</th>
                        <th>Variety</th>
                        <th>Product</th>
                        <th style="width: 100px;">Quantity (pkt) </th>
                        <th style="width: 100px">Quantity (Kg) </th>
                      </tr>
                      </thead>
                      <tbody>
                      <tr v-for="(quantity,pack_size_id) in item.data.delivery_data.pack_sizes" v-if="item.exists">
                        <td>{{pack_sizes_object[pack_size_id]?pack_sizes_object[pack_size_id].crop_name:'NF'}}</td>
                        <td>{{pack_sizes_object[pack_size_id]?pack_sizes_object[pack_size_id].type_name:'NF'}}</td>
                        <td>{{pack_sizes_object[pack_size_id]?pack_sizes_object[pack_size_id].variety_name:'NF'}}</td>
                        <td>{{pack_sizes_object[pack_size_id]?pack_sizes_object[pack_size_id].name:'NF'}}</td>
                        <td class="text-right">{{quantity}}</td>
                        <td class="text-right">{{pack_sizes_object[pack_size_id]?((+pack_sizes_object[pack_size_id].value)*(+quantity)/1000):'0'}}</td>
                      </tr>
                      <tr>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td class="text-right"><label class="font-weight-bold float-right">Total :</label></td>
                        <td class="text-right"><label class="font-weight-bold float-right" id="table_total_quantity_pkt"></label></td>
                        <td class="text-right"><label class="font-weight-bold float-right" id="table_total_quantity_kg"></label></td>
                      </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div class="row mb-2">
                  <div class="col-3"><label class="font-weight-bold">Description :</label></div>
                  <div class="col-9">
                    <div class="input-group"><textarea class="form-control"></textarea></div>
                  </div>
                </div>
                <div class="row mb-2">
                  <div class="col-3"><label class="font-weight-bold">Prepared by :</label></div>
                  <div class="col-9">
                    <div class="input-group">{{globalVariables.user.name}}</div>
                  </div>
                </div>
              </div>
          </div>
          <div class="d-flex justify-content-center">
            System generated, Sign Not Required
          </div>
          <div class="d-flex justify-content-center d-print-none">
              <button type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" onclick="window.print();"><i class="feather icon-printer"></i> {{labels.get('action_4')}}</button>
          </div>
        </div>
      </div>
      <div class="card d-print-none" v-if="item.data.delivery_data['delivery_at']">
        <div class="card-header p-1">
          <a class="btn btn-sm" data-toggle="collapse" href="#label_courier_delivery_info">Courier Info</a>
        </div>
        <div id="label_courier_delivery_info" :class="'collapse'+(item.data.delivery_data['delivery_at']?' show':'')">
          <form id="formSaveCourierDeliveryInfo">
            <div class="card-body">
              <div class="row mb-2">
                <div class="col-4"><label class="font-weight-bold float-right">Courier Name</label></div>
                <div class="col-lg-4 col-8">{{taskData.couriers.find(t=>t.id==item.data.delivery_data['courier_id'])?.name}}</div>
              </div>
              <div class="row mb-2">
                <div class="col-4"><label class="font-weight-bold float-right">Tracking No <span class="text-danger">*</span></label></div>
                <div class="col-lg-4 col-8">
                  <div class="input-group"><input id="quantity_balance_adjusted" type="text" class="form-control" name="item[courier_tracking_number]" :value="item.data.delivery_data['courier_tracking_number']?item.data.delivery_data['courier_tracking_number']:''"></div>
                </div>
              </div>
              <div class="row mb-2">
                <div class="col-4"><label class="font-weight-bold float-right">Destination</label></div>
                <div class="col-lg-4 col-8">
                  <div class="input-group"><textarea class="form-control" name="item[courier_destination]">{{item.data.delivery_data['courier_destination']?item.data.delivery_data['courier_destination']:''}}</textarea></div>
                </div>
              </div>
              <div class="row mb-2">
                <div class="col-4">
                </div>
                <div class="col-4">
                  <button type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" @click="saveCourierInfo()"><i class="feather icon-save"></i> {{labels.get('label_save')}}</button>
                </div>
                <div class="col-4">
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>

  </div>
</template>
<script setup>

import globalVariables from "@/assets/globalVariables";
import systemFunctions from "@/assets/systemFunctions";
import toastFunctions from "@/assets/toastFunctions";
import labels from '@/labels'

import {useRouter} from "vue-router";
import {inject, nextTick, reactive} from "vue";
import axios from "axios";
import InputTemplate from '@/components/InputTemplate.vue';
import {useRoute} from "vue-router/dist/vue-router";


const route =useRoute()
const router =useRouter()
let taskData = inject('taskData')
let dealers_object={};
for(let i in taskData.dealers){
  let dealer_id=taskData.dealers[i]['id'];
  dealers_object[dealer_id]=taskData.dealers[i];
}
let pack_sizes_object={};
for(let i in taskData.pack_sizes){
  pack_sizes_object[taskData.pack_sizes[i]['id']]=taskData.pack_sizes[i];
}
let item=reactive({
  id:'',//link id
  exists:false,
  inputFields:{},
  dealer:{},
  data:{
    id:'',//db id
    dealer_id:'',
    generated_date_id:'',
    bonus_data:{},
    delivery_data:{},
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
    default:item.id,
    mandatory:true
  };
  key='dealer_id';
  item.dealer=dealers_object[item.data[key]]?dealers_object[item.data[key]]:{}
  inputFields[key] = {
    label: labels.get('label_'+key),
    type:'textonly',
    //default:item.data[key],
    default:item.dealer['name'],
    mandatory:false
  };
  key='address';
  inputFields[key] = {
    label: labels.get('label_'+key),
    type:'textonly',
    default:item.dealer['address'],
    mandatory:false
  };
  key='mobile_no';
  inputFields[key] = {
    label: labels.get('label_'+key),
    type:'textonly',
    default:item.dealer['mobile_no'],
    mandatory:false
  };
  key='challan_no';
  inputFields[key] = {
    label: 'Challan Number',
    type:'textonly',
    default:item.id,
    mandatory:false
  };
  key='delivery_at';
  inputFields[key] = {
    name: 'item[' +key +']',
    label: 'Delivery Date',
    type:'datetime-local',
    default:item.data.delivery_data['delivery_at']?item.data.delivery_data['delivery_at']:moment().format('YYYY-MM-DDTHH:mm'),
    mandatory:true
  };
  key='courier_id';
  inputFields[key] = {
    name: 'item[' +key +']',
    label: 'Courier',
    type:'dropdown',
    options:taskData.couriers.map((item)=>{ return {value:item.id,label:item.name}}),
    default:item.data.delivery_data['courier_id']?item.data.delivery_data['courier_id']:'',
    mandatory:true
  };
  key='product_bonus_quantity';
  inputFields[key] = {
    name: 'item[' +key +']',
    label: "Eligible bonus slot",
    type:'textonly',
    default:(+item.data.bonus_data[key]).toFixed(3),
    mandatory:false
  };
  key='quantity_sales';
  inputFields[key] = {
    name: 'item[' +key +']',
    label: "Sales qtn",
    type:'textonly',
    default:item.data.bonus_data[key].toFixed(3),
    mandatory:false
  };
  key='quantity_balance_old';
  inputFields[key] = {
    name: 'item[' +key +']',
    label: 'Old Balance',
    type:'textonly',
    default:item.data.bonus_data[key].toFixed(3),
    mandatory:false
  };
  key='quantity_balance_new';
  inputFields[key] = {
    name: 'item[' +key +']',
    label: 'Current Balance',
    type:'textonly',
    default:item.data.bonus_data[key].toFixed(3),
    mandatory:false
  };
  let num_of_slot=Math.trunc(((+item.data.bonus_data['quantity_sales'])+(+item.data.bonus_data['quantity_balance_old']))/(+item.data.bonus_data['product_bonus_quantity']));
  key='quantity_balance_adjusted';
  inputFields[key] = {
    name: 'item[' +key +']',
    label: 'Adjusted Quantity',
    type:'text',
    class:'float_all',
    default:item.data.delivery_data['quantity_balance_adjusted']?item.data.delivery_data['quantity_balance_adjusted']:(num_of_slot*(+item.data.bonus_data['product_bonus_quantity'])),
    mandatory:true
  };
  key='product_bonus_percentage';
  inputFields[key] = {
    label: 'Bonus percentage',
    type:'textonly',
    default:(+item.data.bonus_data[key]).toFixed(2),
    mandatory:false
  };
  key='bonus_delivery_quantity';
  inputFields[key] = {
    label: 'Bonus Quantity',
    type:'textonly',
    default:(+inputFields['quantity_balance_adjusted']['default']*(+item.data.bonus_data['product_bonus_percentage'])/100).toFixed(3),
    mandatory:false
  };
  item.inputFields=inputFields;
}
const save=async ()=>{
  if((+($('#bonus_delivery_quantity').html()))<(+($('#total_delivery_quantity_kg').html())))
  {
    toastFunctions.showResponseError({error:'VALIDATION_FAILED',messages:"Delivery quantity Cannot be more than Bonus quantity"})
  }
  else{
    let formData=new FormData(document.getElementById('formSaveDelivery'))
    await axios.post(taskData.api_url+'/save-item',formData).then((res)=>{
      if (res.data.error == "") {
        globalVariables.loadListData=true;
        toastFunctions.showSuccessfullySavedMessage();
        getItem();
        //router.push(taskData.api_url)
      }
      else{
        toastFunctions.showResponseError(res.data)
      }
    });
  }


}
const cancelDelivery=async ()=>{
  const userConfirmed = confirm("Are you sure you want to proceed?");
  if(userConfirmed)
  {
    await axios.get(taskData.api_url+'/delete-item/'+ item.id).then((res)=>{
      if (res.data.error == "") {
        globalVariables.loadListData=true;
        toastFunctions.showSuccessfullySavedMessage();
        getItem();
        //router.push(taskData.api_url)
      }
      else{
        toastFunctions.showResponseError(res.data)
      }
    });
  }
  else{
    console.log('cancelted')
  }
}
const getItem=async ()=>{
  item.exists=false;
  await nextTick()
  await axios.get(taskData.api_url+'/get-item/'+ item.id).then(async (res)=>{
    if (res.data.error == "") {
      item.data=res.data.item;
      setInputFields();
      item.exists=true;
      await nextTick()
      $('#pack_size_id').select2();
      calculateTotalDeliveryQuantity();
    }
    else{
      toastFunctions.showResponseError(res.data)
    }
  });
}
  item.id=route.params['item_id']?route.params['item_id']:0;
  if(!(taskData.permissions.action_2)){
    toastFunctions.showAccessDenyMessage();
  }
  else{
    getItem();
  }
const calculateTotalDeliveryQuantity=()=>{
  let total_kg=0;
  let total_pkt=0;
  $(".quantity_pkt").each( function (){
    let quantity=(+$(this).val())
    total_pkt+=quantity;
    let pack_size_value=$(this).attr('data-value');
    total_kg+=(quantity*pack_size_value/1000)
  });
  $('#total_delivery_quantity_kg').html(total_kg.toFixed(3))
  $('#table_total_quantity_pkt').html(total_pkt)
  $('#table_total_quantity_kg').html(total_kg.toFixed(3))
}
$(document).ready(async function() {
  $(document).off("input", "#quantity_balance_adjusted");
  $(document).on("input",'#quantity_balance_adjusted',function(){
    let quantity_balance_adjusted=(+$(this).val())
    let product_bonus_percentage=(+$('#product_bonus_percentage').html())
    $('#bonus_delivery_quantity').html((quantity_balance_adjusted*product_bonus_percentage/100).toFixed(3))
  });

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
      calculateTotalDeliveryQuantity();
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
    calculateTotalDeliveryQuantity();
  });
  $(document).off("click", ".btn_remove_pack_size");
  $(document).on("click",'.btn_remove_pack_size',function(){
    $(this).closest('tr').remove();
  });
});
</script>
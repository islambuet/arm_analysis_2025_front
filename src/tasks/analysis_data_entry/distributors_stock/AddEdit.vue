<template>
  <div class="card d-print-none mb-2">
    <div class="card-body">
      <template v-if="item.exists">
        <button  type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" @click="save(false)"><i class="feather icon-save"></i> {{labels.get('label_save')}}</button>
      </template>
      <router-link v-if="taskData.permissions.action_3"  :to="taskData.api_url+'/upload'" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" ><i class="feather icon-upload"></i> {{labels.get('label_upload')}}</router-link>
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
                <th>Quantity</th>
                <th></th>
              </tr>
              </thead>
              <tbody>
              <tr>
                <td colspan="3">
                  <select id="variety_id" class="form-control">
                    <option value="">{{labels.get('label_select')}}</option>
                    <template v-for="row in taskData.varieties">
                      <option  :value="row.id" v-if="row.status=='Active'">
                        {{row.name}}
                      </option>
                    </template>

                  </select>
                </td>
                <td><input type="text" class="form-control float_positive" id="quantity" value=""></td>
                <td><button type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-primary btn_add_more_variety"><i class="bi bi-plus-circle"></i> {{labels.get('action_1')}}</button></td>
              </tr>
              <tr v-for="(quantity,variety_id) in item.stock" v-if="item.exists">
                <td>{{varieties_object[variety_id]?varieties_object[variety_id].crop_name:'NF'}}</td>
                <td>{{varieties_object[variety_id]?varieties_object[variety_id].type_name:'NF'}}</td>
                <td>{{varieties_object[variety_id]?varieties_object[variety_id].name:'NF'}}</td>
                <td><input type="text" class="form-control float_positive" :name="'item[stock]['+variety_id+']'" :value="quantity"></td>
                <td><button type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-danger btn_remove_variety"><i class="bi bi-dash-circle"></i> Remove </button></td>
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

    import labels from '@/labels'
    import {inject, reactive, ref} from 'vue'
    import {useRouter} from 'vue-router';
    import axios from "axios";
    import InputTemplate from '@/components/InputTemplate.vue';
    import ColumnControl from '@/components/ColumnControl.vue';
    import toastFunctions from "@/assets/toastFunctions";

    const router =useRouter()
    let taskData = inject('taskData')
    let show_column_controls=ref(false)
    let item=reactive({
      id:0,
      exists:false,
      inputFields:{},
      inputFields2:{crop_types:[],varieties:[]},
      stock:{}
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
      key='month';
      inputFields[key] = {
        name: 'item[' +key +']',
        label: labels.get('label_'+key),
        type:'dropdown',
        options:new Array(12).fill().map((temp,index) => {return {value:index+1,label:labels.get('label_month_short_'+(index+1))}}),
        default:globalVariables.current_month,
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
        name: 'item[' +key +']',
        label: labels.get('label_'+key),
        type:'dropdown',
        options:(taskData.user_locations.territory_id>0)?taskData.distributors.filter((temp)=>{ if((temp.territory_id==taskData.user_locations.territory_id) && (temp.status=='Active')){temp.value=temp.id.toString();temp.label=temp.name;return true}}):[],
        default:'',
        mandatory:false
      };
      item.inputFields=inputFields;

    }
    const save=async (save_and_new)=>{
      let formData=new FormData(document.getElementById('formSaveItem'))
      await axios.post(taskData.api_url+'/save-item',formData).then((res)=>{
        if (res.data.error == "") {
          toastFunctions.showSuccessfullySavedMessage();
          item.exists=false;
          $('#distributor_id').val('');
          $('#save_token').val(new Date().getTime());

        }
        else{
          toastFunctions.showResponseError(res.data)
        }
      });

    }
    const getItem=async ()=>{
      item.exists=false;
      $('#table_varieties tbody tr:not(:first)').remove();
      if($('#distributor_id').val()>0){
        await systemFunctions.delay(1);
        let formData=new FormData(document.getElementById('formSaveItem'))
        await axios.post(taskData.api_url+'/get-item',formData).then((res)=>{
          if (res.data.error == "") {
            if(res.data.item.stock){
              item.stock=res.data.item.stock;
            }
            else{
              item.stock={}
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
      $('#variety_id').select2();
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
        item.exists=false;
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
      $(document).off("change", "#distributor_id");
      $(document).on("change",'#distributor_id',async function()
      {
        getItem()
      })
      $(document).off("click", ".btn_add_more_variety");
      $(document).on("click",'.btn_add_more_variety',function()
      {
        let variety_id=$('#variety_id').val();
        if(variety_id>0){
          let crop_name='NF';
          let type_name='NF';
          let variety_name='NF';
          if(varieties_object[variety_id]){
            variety_name=varieties_object[variety_id].name;
            crop_name=varieties_object[variety_id].crop_name;
            type_name=varieties_object[variety_id].type_name;
          }

          let html=('<tr><td>'+crop_name+'</td>');
            html+=('<td>'+type_name+'</td>');
            html+=('<td>'+variety_name+'</td>');
            html+=('<td><input type="text" class="form-control float_positive" name="item[stock]['+variety_id+']" value="'+$('#quantity').val()+'"></td>');
            html+='<td><button type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-danger btn_remove_variety"><i class="bi bi-dash-circle"></i> Remove </button>';
            html+='</tr>';
            $(this).closest("tr").after(html);
        }
        $('#variety_id').val('');
        $('#select2-variety_id-container').html(labels.get('label_select'));
        $('#quantity').val('')
      })
      $(document).off("click", ".btn_remove_variety");
      $(document).on("click",'.btn_remove_variety',function(){
        $(this).closest('tr').remove();
      });

    });
</script>

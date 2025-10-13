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
        <div v-if="item.exists">
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
                      <option v-for="row in item.inputFields2.varieties_competitor" :value="row.id">
                        {{row.name}}
                      </option>
                    </select>
                  </td>
                  <td>
                    <template v-for="row in item.inputFields2.varieties_arm">
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
              <label class="font-weight-bold float-right">{{labels.get('label_territory_recommendation')}}</label>
            </div>
            <div class="col-lg-4 col-8">
              <textarea class="form-control" name="item[territory_recommendation]">{{item.data.territory_recommendation}}</textarea>
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
              <th v-for="row in item.inputFields2.varieties_arm">
                {{row.name}}
              </th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <td>Sales FY-{{(item.fiscal_year-2)+'-'+(item.fiscal_year-1)}}</td>
              <td v-for="row in item.inputFields2.varieties_arm">
                {{item.sales['year_2'] && item.sales['year_2'][row.id] ?item.sales['year_2'][row.id]['quantity'].toFixed(3):''}}
              </td>
            </tr>
            <tr>
              <td>Sales FY-{{(item.fiscal_year-1)+'-'+(item.fiscal_year)}}</td>
              <td v-for="row in item.inputFields2.varieties_arm">
                {{item.sales['year_1'] && item.sales['year_1'][row.id] ?item.sales['year_1'][row.id]['quantity'].toFixed(3):''}}
              </td>
            </tr>
            <template v-for="i in 3">
              <tr>
                <td :colspan="item.inputFields2.varieties_arm.length+1" class="text-center"><strong>Sales Activities For FY-{{(item.fiscal_year+i-1)+'-'+(item.fiscal_year+i)}}</strong></td>
              </tr>
              <tr v-for="key in ['forecast','dealer_meeting','farmer_meeting','num_demo','num_result_sharing','num_field_day']">
                <td>{{labels.get('label_'+key)}}</td>
                <td v-for="row in item.inputFields2.varieties_arm">
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
      fiscal_year:globalVariables.current_year,
      exists:false,
      inputFields:{},
      inputFields2:{varieties_arm:[],varieties_competitor:[]},
      data:{},
      sales:{},
    })
    const setItemDefaults=async ()=>{
      item.data={
        pocket_market:'',
        competitor_variety_major: {},
        territory_recommendation:'',
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
    const getItem=async ()=>{
      let formData=new FormData(document.getElementById('formSaveItem'))
      item.exists=false;
      if(($('#type_id').val()>0)&&($('#territory_id').val()>0)&&($('#fiscal_year').val()>0)){
        await axios.post(taskData.api_url+'/get-item',formData).then((res)=>{
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
          $('#type_id').val('');
          item.exists=false;
          $('#save_token').val(new Date().getTime());
        }
        else{
          toastFunctions.showResponseError(res.data)
        }
      });

    }
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
        item.fiscal_year=(+$(this).val());
        getItem()
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
              $(this).prop('checked', false);
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
        $('#competitor_variety_major').val(0);

      })
      $(document).off("click", ".btn_remove_competitor_variety_major");
      $(document).on("click",'.btn_remove_competitor_variety_major',function(){
        let row_type_id=$(this).closest('.row_type').attr('id');
        $(this).closest('tr').remove();
      });
    });

</script>

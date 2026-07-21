<template>
  <div class="card d-print-none mb-2">
    <div class="card-body">
      <router-link :to="taskData.api_url" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" ><i class="feather icon-corner-up-left"></i> {{labels.get('label_back')}}</router-link>
      <button type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" @click="search"><i class="feather icon-save"></i> {{labels.get('label_search')}}</button>
    </div>
  </div>
  <div class="card d-print-none mb-2">
    <div class="card-header">
      <div>{{labels.get('label_details_task')}} ({{item.id}})</div>
    </div>
    <div class="card-body">
      <div class="card-body">
        <form id="formDetailsSearch">

          <div class="row mb-2">
            <div class="col-md-2">
              <div class="row">
                <div class="col-4">
                  <label class="font-weight-bold float-right">{{labels.get('label_part_name')}}</label>
                </div>
                <div class="col-8">
                  <div class="input-group">
                    <select id="details_search_part_id" class="form-control" name="options[part_id]">
                      <option value="">{{labels.get('label_select')}}</option>
                      <option v-for="row in taskData.location_parts" :value="row.id">
                        {{row.name}}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-2">
              <div class="row">
                <div class="col-4">
                  <label class="font-weight-bold float-right">{{labels.get('label_area_name')}}</label>
                </div>
                <div class="col-8">
                  <div class="input-group">
                    <select id="details_search_area_id" class="form-control" name="options[area_id]">
                      <option value="">{{labels.get('label_select')}}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-2">
              <div class="row">
                <div class="col-4">
                  <label class="font-weight-bold float-right">{{labels.get('label_territory_name')}}</label>
                </div>
                <div class="col-8">
                  <div class="input-group">
                    <select id="details_search_territory_id" class="form-control" name="options[territory_id]">
                      <option value="">{{labels.get('label_select')}}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-2">
              <div class="row">
                <div class="col-4">
                  <label class="font-weight-bold float-right">{{labels.get('label_distributor_name')}}</label>
                </div>
                <div class="col-8">
                  <div class="input-group">
                    <select id="details_search_distributor_id" class="form-control" name="options[distributor_id]">
                      <option value="">{{labels.get('label_select')}}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-2">
              <div class="row">
                <div class="col-4">
                  <label class="font-weight-bold float-right">{{labels.get('label_dealer_id')}}</label>
                </div>
                <div class="col-8">
                  <div class="input-group">
                    <select id="details_search_dealer_id" class="form-control" name="options[dealer_id]">
                      <option value="">{{labels.get('label_select')}}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-md-2">
              <div class="row">
                <div class="col-4">
                  <label class="font-weight-bold float-right">{{labels.get('label_crop_name')}}</label>
                </div>
                <div class="col-8">
                  <div class="input-group">
                    <select id="details_search_crop_id" class="form-control" name="options[crop_id]">
                      <option value="">{{labels.get('label_select')}}</option>
                      <option v-for="row in taskData.crops" :value="row.id">
                        {{row.name}}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-2">
              <div class="row">
                <div class="col-4">
                  <label class="font-weight-bold float-right">Record</label>
                </div>
                <div class="col-8">
                  <div class="input-group">
                    <select id="details_search_show_eligible" class="form-control" name="options[crop_id]">
                      <option value="Yes">Only Eligible</option>
                      <option value="No">Not Eligible</option>
                      <option value="All">All</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
  <div class="card" v-if="show_report">
    <div class="card-body pb-0 d-print-none">
      <button type="button" class="mr-2 mb-2 btn btn-sm bg-gradient-primary" @click="showHtmlContentInNewWindow"><i class="feather icon-maximize-2"></i> {{labels.get('action_show_in_new_window')}}</button>
      <span>Total Records:{{item.rows.length}}</span>
    </div>
    <div class="card-body" style='overflow-x:auto;height:600px;padding: 0'>
      <table id="table_report" :style="'width: 1800px'" class="table table-bordered sticky">
        <thead class="table-active">
        <tr>
          <template v-for="(column,key) in item.columns.all">
            <th :style="'width: '+(column.width?column.width:150)+'px;'" v-if="taskData.columns.hidden.indexOf(column.group)<0" :key="'th_'+key">
              <div v-html="column.label"></div>
            </th>
          </template>
        </tr>
        </thead>
        <tbody class="table-striped table-hover">


        <template v-for="row in item.rows">
          <tr>
            <template v-for="(column,key) in item.columns.all">
              <td :class="((['quantity_eligible','quantity_balance_old','quantity_sales','quantity_balance_new','quantity_delivered','quantity_num_delivered'].indexOf(key) != -1)?'text-right':'')+(column.class?(' '+column.class):' col_9')" >
                <template v-if="(['crop_type_name'].indexOf(key) != -1)">
                  <div v-html="row[key]"></div>
                </template>
                <template  v-else>{{ row[key] }}</template>
              </td>
            </template>
          </tr>
        </template>
        </tbody>
      </table>
    </div>

  </div>
</template>
<script setup>


  import toastFunctions from "@/assets/toastFunctions";
  import labels from '@/labels'
  
  import {useRouter} from "vue-router";
  import {inject, reactive, ref} from "vue";
  import axios from "axios";
  import DetailTemplate from '@/components/DetailTemplate.vue';
  import {useRoute} from "vue-router/dist/vue-router";
  import systemFunctions from "@/assets/systemFunctions";


  const route =useRoute()
  const router =useRouter()
  let taskData = inject('taskData')
  let show_report=ref(false)
  let item=reactive({
    columns:{all:{},hidden:[],sort:{key:'',dir:''}},
    id:0,
    exists:false,
    detailFields:{},
    rows:[]
  })
  const setColumns=()=>{
    let columns={}

    let key='part_name';
    columns[key]={
      label: labels.get('label_'+key),
      hideable:true,
      filterable:true,
      sortable:true,
      type:'dropdown',
      filter:{from:'',to:'',options:taskData.location_parts.map((item)=>{ return {value:item.name,label:item.name}}),}
    };
    key='area_name';
    columns[key]={
      label: labels.get('label_'+key),
      hideable:true,
      filterable:true,
      sortable:true,
      type:'text',
      filter:{from:'',to:''}
    };
    key='territory_name';
    columns[key]={
      label: labels.get('label_'+key),
      hideable:true,
      filterable:true,
      sortable:true,
      type:'text',
      filter:{from:'',to:''}
    };
    key='distributor_name';
    columns[key]={
      label: labels.get('label_'+key),
      hideable:true,
      filterable:true,
      sortable:true,
      type:'text',
      filter:{from:'',to:''}
    };
    key='dealer_name';
    columns[key]={
      label: labels.get('label_'+key),
      hideable:true,
      filterable:true,
      sortable:true,
      type:'text',
      filter:{from:'',to:''}
    };
    key='crop_name';
    columns[key]={
      label: labels.get('label_'+key),
      hideable:true,
      filterable:true,
      sortable:true,
      type:'dropdown',
      filter:{from:'',to:'',options:taskData.crops.map((item)=>{ return {value:item.name,label:item.name}}),}
    };
    key='crop_type_name';
    columns[key]={
      label: labels.get('label_'+key),
      hideable:true,
      filterable:true,
      sortable:true,
      type:'text',
      filter:{from:'',to:''}
    };
    key='quantity_eligible';
    columns[key]={
      label: "Eligible qtn",
      hideable:true,
      filterable:true,
      sortable:true,
      type:'text',
      filter:{from:'',to:''}
    };
    key='quantity_sales';
    columns[key]={
      label: "Sales qtn",
      hideable:true,
      filterable:true,
      sortable:true,
      type:'text',
      filter:{from:'',to:''}
    };
    key='quantity_balance_old';
    columns[key]={
      label: "Old Balance",
      hideable:true,
      filterable:true,
      sortable:true,
      type:'text',
      filter:{from:'',to:''}
    };
    key='quantity_delivered';
    columns[key]={
      label: "Delivery Qtn",
      hideable:true,
      filterable:true,
      sortable:true,
      type:'text',
      filter:{from:'',to:''}
    };
    key='quantity_balance_new';
    columns[key]={
      label: "New Balance",
      hideable:true,
      filterable:true,
      sortable:true,
      type:'text',
      filter:{from:'',to:''}
    };

    item.columns.all=columns
  }
  setColumns();
  const showHtmlContentInNewWindow=async ()=>{
    systemFunctions.showHtmlContentInNewWindow('<table>'+$('#table_report').html()+'</table>',labels.get('label_task'))
  }
  const search=async ()=> {
    show_report.value=false;
    let crop_id=$('#details_search_crop_id').val();
    let show_eligible=$('#details_search_show_eligible').val();
    let formData=new FormData(document.getElementById('formDetailsSearch'))
    await axios.post(taskData.api_url+'/get-item/'+ item.id,formData).then((res)=>{
      if (res.data.error == "") {
        let bonus_items=res.data.dealer_data;
        let rows=[]
        for(let i in bonus_items){
          let bonus_item=bonus_items[i];
          let bonus_data=JSON.parse(bonus_item['bonus_data'])
          for(let j in bonus_data){
            let bonus_datum=bonus_data[j];
            //if(crop_id>0 && crop_id!=taskData.bonus_setup[])
            if(crop_id>0){
              if(taskData.bonus_setup[j]['crop_id']!=crop_id)
                continue;
            }
            if(show_eligible=="Yes")
            {
              if((+bonus_datum['quantity_sales'])+(+bonus_datum['quantity_balance_old'])<(+bonus_datum['quantity_eligible']))
                continue;
            }
            else if(show_eligible=="No")
            {
              if((+bonus_datum['quantity_sales'])+(+bonus_datum['quantity_balance_old'])>=(+bonus_datum['quantity_eligible']))
                continue;
            }


            //if((+bonus_datum['quantity_sales'])+(+bonus_datum['quantity_balance_old'])>=(+bonus_datum['quantity_eligible']))
            {
              let row={}
              row['id']=(bonus_item['id']+'_'+j)
              row['part_name']=(bonus_item['part_name'])
              row['area_name']=(bonus_item['area_name'])
              row['territory_name']=(bonus_item['territory_name'])
              row['distributor_name']=(bonus_item['distributor_name'])
              row['dealer_name']=(bonus_item['dealer_name'])
              row['crop_name']=(taskData.bonus_setup[j]?taskData.bonus_setup[j]['crop_name']:j);
              row['crop_type_name']=(taskData.bonus_setup[j]?taskData.bonus_setup[j]['crop_type_name']:j);
              row['quantity_eligible']=(bonus_datum['quantity_eligible'])
              row['quantity_sales']=(bonus_datum['quantity_sales'])
              row['quantity_balance_old']=(bonus_datum['quantity_balance_old'])
              row['quantity_delivered']=(bonus_datum['quantity_delivered'])
              row['quantity_balance_new']=(bonus_datum['quantity_balance_new'])
              rows.push(row)
            }
          }
        }
        item.rows=rows;
        show_report.value = true;
      }
      else{
        toastFunctions.showResponseError(res.data)
      }
    });


  }
  item.id=route.params['item_id'];
  //getItem();
  $(document).ready(async function()
  {
    $(document).off("change", "#details_search_part_id");
    $(document).on("change",'#details_search_part_id',async function()
    {
      let part_id=$(this).val();
      let html='<option value="">'+labels.get('label_select')+'</option>';
      $('#details_search_territory_id').html(html);
      $('#details_search_distributor_id').html(html);
      $('#details_search_dealer_id').html(html);

      for(let i in taskData.location_areas){
        let location=taskData.location_areas[i];
        if(location['part_id']==part_id){
          html+=('<option value="'+location['id']+'" >'+location['name']+'</option>');
        }
      }
      $('#details_search_area_id').html(html);

    })
    $(document).off("change", "#details_search_area_id");
    $(document).on("change",'#details_search_area_id',async function()
    {
      let area_id=$(this).val();
      let html='<option value="">'+labels.get('label_select')+'</option>';
      $('#details_search_distributor_id').html(html);
      $('#details_search_dealer_id').html(html);
      for(let i in taskData.location_territories){
        let location=taskData.location_territories[i];
        if(location['area_id']==area_id){
          html+=('<option value="'+location['id']+'" >'+location['name']+'</option>');
        }
      }
      $('#details_search_territory_id').html(html);
    })
    $(document).off("change", "#details_search_territory_id");
    $(document).on("change",'#details_search_territory_id',async function()
    {
      let territory_id=$(this).val();
      let html='<option value="">'+labels.get('label_select')+'</option>';
      $('#details_search_dealer_id').html(html);
      for(let i in taskData.distributors){
        let location=taskData.distributors[i];
        if(location['territory_id']==territory_id){
          html+=('<option value="'+location['id']+'" >'+location['name']+'</option>');
        }
      }
      $('#details_search_distributor_id').html(html);
    })
    $(document).off("change", "#details_search_distributor_id");
    $(document).on("change",'#details_search_distributor_id',async function()
    {
      let distributor_id=$(this).val();
      let html='<option value="">'+labels.get('label_select')+'</option>';
      for(let i in taskData.dealers){
        let location=taskData.dealers[i];
        if(location['distributor_id']==distributor_id){
          html+=('<option value="'+location['id']+'" >'+location['name']+'</option>');
        }
      }
      $('#details_search_dealer_id').html(html);
    })
  });
</script>
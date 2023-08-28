import React, { useRef, useState, useEffect, useLayoutEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTheme } from "@material-ui/core/styles";
import theme from '../theme.jsx';
import { useAlert } from "react-alert";

import { v4 as uuidv4 } from "uuid";
import {
  ListItemText,
  TextField,
  Drawer,
  Button,
  Paper,
  Grid,
  Tabs,
  InputAdornment,
  Tab,
  ButtonBase,
  Tooltip,
  Select,
  MenuItem,
  Divider,
  Dialog,
  Modal,
  DialogActions,
  DialogTitle,
  InputLabel,
  DialogContent,
  FormControl,
  IconButton,
  Menu,
  Input,
  FormGroup,
  FormControlLabel,
  Typography,
  Checkbox,
  Breadcrumbs,
  CircularProgress,
  Switch,
  Fade,
} from "@material-ui/core";
import { 
	LockOpen as LockOpenIcon,
	SupervisorAccount as SupervisorAccountIcon,
} from "@mui/icons-material";

const ITEM_HEIGHT = 55;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      minWidth: 500,
      maxWidth: 500,
      scrollX: "auto",
    },
  },
  variant: "menu",
  getContentAnchorEl: null,
};

const registeredApps = [
	"gmail",
	"slack",
	"webex",
	"zoho_desk",
	"outlook_graph",
	"outlook_office365",
	"microsoft_teams",
	"microsoft_teams_user_access",
	"todoist",
	"microsoft_sentinel",
	"microsoft_365_defender",
	"google_sheets",
	"google_drive",
	"google_disk",
	"jira",
	"jira_service_desk",
	"jira_service_management",
	"github",
]

const AuthenticationOauth2 = (props) => {
  const {
    saveWorkflow,
    selectedApp,
    workflow,
    selectedAction,
    authenticationType,
    getAppAuthentication,
    appAuthentication,
    setSelectedAction,
    setNewAppAuth,
		isCloud,
		autoAuth, 
		authButtonOnly, 
		isLoggedIn,
  } = props;

  let navigate = useNavigate();
  const alert = useAlert()

  //const [update, setUpdate] = React.useState("|")
  const [defaultConfigSet, setDefaultConfigSet] = React.useState(
    authenticationType.client_id !== undefined &&
      authenticationType.client_id !== null &&
      authenticationType.client_id.length > 0 &&
      authenticationType.client_secret !== undefined &&
      authenticationType.client_secret !== null &&
      authenticationType.client_secret.length > 0
  );	

  const [clientId, setClientId] = React.useState(
    defaultConfigSet ? authenticationType.client_id : ""
  );
  const [clientSecret, setClientSecret] = React.useState(
    defaultConfigSet ? authenticationType.client_secret : ""
  );
  const [oauthUrl, setOauthUrl] = React.useState("");
  const [buttonClicked, setButtonClicked] = React.useState(false);

  const [offlineAccess, setOfflineAccess] = React.useState(true);
  const allscopes = authenticationType.scope !== undefined ? authenticationType.scope : [];
    

  const [selectedScopes, setSelectedScopes] = React.useState(allscopes.length === 1 ? [allscopes[0]] : [])
  const [manuallyConfigure, setManuallyConfigure] = React.useState(
    defaultConfigSet ? false : true
  );
  const [authenticationOption, setAuthenticationOptions] = React.useState({
    app: JSON.parse(JSON.stringify(selectedApp)),
    fields: {},
    label: "",
    usage: [
      {
        workflow_id: workflow !== undefined ? workflow.id : "",
      },
    ],
    id: uuidv4(),
    active: true,
  });


	useEffect(() => {
		if (isLoggedIn === false) {
			navigate(`/login?view=${window.location.pathname}&message=Log in to authenticate this app`)
		}

		console.log("Should automatically click the auto-auth button?: ", autoAuth)
		if (autoAuth === true && selectedApp !== undefined) {
			startOauth2Request() 
		}
	}, [])

  if (selectedApp.authentication === undefined) {
    return null;
  }

	const startOauth2Request = (admin_consent) => {
		// Admin consent also means to add refresh tokens
		console.log("Inside oauth2 request for app: ", selectedApp.name)
		selectedApp.name = selectedApp.name.replace(" ", "_").toLowerCase()

		//console.log("APP: ", selectedApp)
		if (selectedApp.name.toLowerCase() == "outlook_graph" || selectedApp.name.toLowerCase() == "outlook_office365") {
			handleOauth2Request(
				"efe4c3fe-84a1-4821-a84f-23a6cfe8e72d",
				"",
				"https://graph.microsoft.com",
				["Mail.ReadWrite", "Mail.Send", "offline_access"],
				admin_consent,
			);
		} else if (selectedApp.name.toLowerCase() == "gmail") {
			handleOauth2Request(
				"253565968129-6ke8086pkp0at16m8t95rdcsas69ngt1.apps.googleusercontent.com",
				"",
				"https://gmail.googleapis.com",
				["https://www.googleapis.com/auth/gmail.modify",
					"https://www.googleapis.com/auth/gmail.send",
					"https://www.googleapis.com/auth/gmail.insert",
					"https://www.googleapis.com/auth/gmail.compose",
					],
				admin_consent,
				"select_account%20consent", 
			)
		} else if (selectedApp.name.toLowerCase() == "zoho_desk") {
			handleOauth2Request(
				"1000.ZR5MHUW6B0L6W1VUENFGIATFS0TOJT",
				"",
				"https://desk.zoho.com",
				["Desk.tickets.READ",
				"Desk.tickets.UPDATE",
				"Desk.tickets.DELETE",
				"Desk.tickets.CREATE",
				"offline_access"],
				admin_consent,
			)
		} else if (selectedApp.name.toLowerCase() == "slack") {
			handleOauth2Request(
				"5155508477298.5168162485601",
				"",
				"https://slack.com",
				["chat:write:user", "im:read", "im:write", "search:read", "usergroups:read", "usergroups:write",],
				admin_consent,
			)
		} else if (selectedApp.name.toLowerCase() == "webex") {
			handleOauth2Request(
				"Cab184f3d7271f540443c79b5b79845e3387abbbdb3db4233a87ea3a5432fb3d5",
				"",
				"https://webexapis.com",
				["spark:all"],
				admin_consent,
			)
		} else if (selectedApp.name.toLowerCase().includes("microsoft_teams")) {
			handleOauth2Request(
				"31cb4c84-658e-43d5-ae84-22c9142e967a",
				"",
				"https://graph.microsoft.com",
				["ChannelMessage.Edit", "ChannelMessage.Read.All", "ChannelMessage.Send", "Chat.Create", "Chat.ReadWrite", "Chat.Read", "offline_access"],
				admin_consent,
			)
		} else if (selectedApp.name.toLowerCase().includes("todoist")) {
			handleOauth2Request(
				"35fa3a384040470db0c8527e90a3c2eb",
				"",
				"https://api.todoist.com",
				["task:add",],
				admin_consent,
			)
		} else if (selectedApp.name.toLowerCase().includes("microsoft_sentinel")) {
			handleOauth2Request(
				"4c16e8c4-3d34-4aa1-ac94-262ea170b7f7",
				"",
				"https://management.azure.com",
				["https://management.azure.com/user_impersonation",],
				admin_consent,
			)
		} else if (selectedApp.name.toLowerCase().includes("microsoft_365_defender")) {
			handleOauth2Request(
				"4c16e8c4-3d34-4aa1-ac94-262ea170b7f7",
				"",
				"https://graph.microsoft.com",
				["SecurityEvents.ReadWrite.All",],
				admin_consent,
			)
		} else if (selectedApp.name.toLowerCase().includes("google_sheets")) {
			handleOauth2Request(
				"253565968129-mppu17aciek8slr3kpgnb37hp86dmvmb.apps.googleusercontent.com",
				"",
				"https://sheets.googleapis.com",
				["https://www.googleapis.com/auth/spreadsheets"],
				admin_consent,
				"consent",
			)
		} else if (selectedApp.name.toLowerCase().includes("google_drive") || selectedApp.name.toLowerCase().includes("google_disk")) {
			handleOauth2Request(
				"253565968129-6pij4g6ojim4gpum0h9m9u3bc357qsq7.apps.googleusercontent.com",
				"",
				"https://www.googleapis.com",
				["https://www.googleapis.com/auth/drive",],
				admin_consent,
				"consent",
			)
		} else if (selectedApp.name.toLowerCase().includes("jira_service_desk") || selectedApp.name.toLowerCase().includes("jira") || selectedApp.name.toLowerCase().includes("jira_service_management")) {
			handleOauth2Request(
				"AI02egeCQh1Zskm1QAJaaR6dzjR97V2F",
				"",
				"https://api.atlassian.com",
				["read:jira-work", "write:jira-work", "read:servicedesk:jira-service-management", "write:servicedesk:jira-service-management", "read:request:jira-service-management", "write:request:jira-service-management",],
				admin_consent,
			)
		} else if (selectedApp.name.toLowerCase().includes("github")) {
			handleOauth2Request(
				"3d272b1b782b100b1e61",
				"",
				"https://api.github.com",
				["repo","user","project","notifications",],
				admin_consent,
			)
		} else {
			console.log("No match found for: ", selectedApp.name)
		}
		// write:request:jira-service-management
	}


  const handleOauth2Request = (client_id, client_secret, oauth_url, scopes, admin_consent, prompt) => {
    setButtonClicked(true);
    //console.log("SCOPES: ", scopes);

		client_id = client_id.trim()
		client_secret = client_secret.trim()
		oauth_url = oauth_url.trim()

    var resources = "";
    if (scopes !== undefined && (scopes !== null) & (scopes.length > 0)) {
			console.log("IN scope 1")
			if (offlineAccess === true && !scopes.includes("offline_access")) {

				console.log("IN scope 2")
				if (!authenticationType.redirect_uri.includes("google")) {
					console.log("Appending offline access")
					scopes.push("offline_access")
				}
			}

      resources = scopes.join(" ");
      //resources = scopes.join(",");
    }

    const authentication_url = authenticationType.token_uri;
    //console.log("AUTH: ", authenticationType)
    //console.log("SCOPES2: ", resources)
    const redirectUri = `${window.location.protocol}//${window.location.host}/set_authentication`;
		const workflowId = workflow !== undefined ? workflow.id : "";
    var state = `workflow_id%3D${workflowId}%26reference_action_id%3d${selectedAction.app_id}%26app_name%3d${selectedAction.app_name}%26app_id%3d${selectedAction.app_id}%26app_version%3d${selectedAction.app_version}%26authentication_url%3d${authentication_url}%26scope%3d${resources}%26client_id%3d${client_id}%26client_secret%3d${client_secret}`;


		// This is to make sure authorization can be handled WITHOUT being logged in,
		// kind of making it act like an api key
		// https://shuffler.io/authorization -> 3rd party integration auth
		const urlParams = new URLSearchParams(window.location.search);
		const userAuth = urlParams.get("authorization");
		if (userAuth !== undefined && userAuth !== null && userAuth.length > 0) {
			console.log("Adding authorization from user side")
			state += `%26authorization%3d${userAuth}`;
		}

		// Check for org_id
		const orgId = urlParams.get("org_id");
		if (orgId !== undefined && orgId !== null && orgId.length > 0) {
			console.log("Adding org_id from user side")
			state += `%26org_id%3d${orgId}`;
		}

    if (oauth_url !== undefined && oauth_url !== null && oauth_url.length > 0) {
      state += `%26oauth_url%3d${oauth_url}`;
      console.log("ADDING OAUTH2 URL: ", state);
    }


    if (
      authenticationType.refresh_uri !== undefined &&
      authenticationType.refresh_uri !== null &&
      authenticationType.refresh_uri.length > 0
    ) {
      state += `%26refresh_uri%3d${authenticationType.refresh_uri}`;
    } else {
      state += `%26refresh_uri%3d${authentication_url}`;
    }

		// No prompt forcing
    //var url = `${authenticationType.redirect_uri}?client_id=${client_id}&redirect_uri=${redirectUri}&response_type=code&prompt=login&scope=${resources}&state=${state}&access_type=offline`;
		var defaultPrompt = "login"
   	if (prompt !== undefined && prompt !== null && prompt.length > 0) {
			defaultPrompt = prompt
		}
		
		var url = `${authenticationType.redirect_uri}?client_id=${client_id}&redirect_uri=${redirectUri}&response_type=code&prompt=${defaultPrompt}&scope=${resources}&state=${state}&access_type=offline`;

		if (admin_consent === true) {
			console.log("Running Oauth2 WITH admin consent")
    	//url = `${authenticationType.redirect_uri}?client_id=${client_id}&redirect_uri=${redirectUri}&response_type=code&prompt=consent&scope=${resources}&state=${state}&access_type=offline`;
    	url = `${authenticationType.redirect_uri}?client_id=${client_id}&redirect_uri=${redirectUri}&response_type=code&prompt=admin_consent&scope=${resources}&state=${state}&access_type=offline`;
		}

		console.log("URL: ", url)

		// Force new consent
    //const url = `${authenticationType.redirect_uri}?client_id=${client_id}&redirect_uri=${redirectUri}&response_type=code&scope=${resources}&prompt=consent&state=${state}&access_type=offline`;

		// Admin consent
    //const url = `https://accounts.zoho.com/oauth/v2/auth?response_type=code&client_id=${client_id}&scope=AaaServer.profile.Read&redirect_uri=${redirectUri}&prompt=consent`
    
		// &resource=https%3A%2F%2Fgraph.microsoft.com&

    // FIXME: Awful, but works for prototyping
    // How can we get a callback properly realtime?
    // How can we properly try-catch without breaks on error?
    try {
      var newwin = window.open(url, "", "width=582,height=700");
      //console.log(newwin)

      var open = true;
      const timer = setInterval(() => {
        if (newwin.closed) {
					console.log("Closing?")


          setButtonClicked(false);
          clearInterval(timer);
          //alert('"Secure Payment" window closed!');
					//

					if (getAppAuthentication !== undefined) {
          	getAppAuthentication(true, true, true);
					}
        } else {
					console.log("Not closed")
				}
      }, 1000);
      //do {
      //	setTimeout(() => {
      //		console.log(newwin)
      //		console.log("CLOSED", newwin.closed)
      //		if (newwin.closed) {

      //			open = false
      //		}
      //	}, 1000)
      //}
      //while(open === true)
    } catch (e) {
      alert.error(
        "Failed authentication - probably bad credentials. Try again"
      );
      setButtonClicked(false);
    }

    return;
    //do {
    //} while (
  };

  authenticationOption.app.actions = [];

  for (var key in selectedApp.authentication.parameters) {
    if (
      authenticationOption.fields[
        selectedApp.authentication.parameters[key].name
      ] === undefined
    ) {
      authenticationOption.fields[
        selectedApp.authentication.parameters[key].name
      ] = "";
    }
  }

  const handleSubmitCheck = () => {
    console.log("NEW AUTH: ", authenticationOption);
    if (authenticationOption.label.length === 0) {
      authenticationOption.label = `Auth for ${selectedApp.name}`;
      //alert.info("Label can't be empty")
      //return
    }

    // Automatically mapping fields that already exist (predefined).
    // Warning if fields are NOT filled
    for (var key in selectedApp.authentication.parameters) {
      if (
        authenticationOption.fields[
          selectedApp.authentication.parameters[key].name
        ].length === 0
      ) {
        if (
          selectedApp.authentication.parameters[key].value !== undefined &&
          selectedApp.authentication.parameters[key].value !== null &&
          selectedApp.authentication.parameters[key].value.length > 0
        ) {
          authenticationOption.fields[
            selectedApp.authentication.parameters[key].name
          ] = selectedApp.authentication.parameters[key].value;
        } else {
          if (
            selectedApp.authentication.parameters[key].schema.type === "bool"
          ) {
            authenticationOption.fields[
              selectedApp.authentication.parameters[key].name
            ] = "false";
          } else {
            alert.info(
              "Field " + selectedApp.authentication.parameters[key].name.replace("_basic", "", -1).replace("_", " ", -1) + " can't be empty"
                
            );
            return;
          }
        }
      }
    }

    console.log("Action: ", selectedAction);
    selectedAction.authentication_id = authenticationOption.id;
    selectedAction.selectedAuthentication = authenticationOption;
    if (
      selectedAction.authentication === undefined ||
      selectedAction.authentication === null
    ) {
      selectedAction.authentication = [authenticationOption];
    } else {
      selectedAction.authentication.push(authenticationOption);
    }

    setSelectedAction(selectedAction);

    var newAuthOption = JSON.parse(JSON.stringify(authenticationOption));
    var newFields = [];
    for (const key in newAuthOption.fields) {
      const value = newAuthOption.fields[key];
      newFields.push({
        key: key,
        value: value,
      });
    }

    console.log("FIELDS: ", newFields);
    newAuthOption.fields = newFields;
    setNewAppAuth(newAuthOption);
    //appAuthentication.push(newAuthOption)
    //setAppAuthentication(appAuthentication)
    //

    //if (configureWorkflowModalOpen) {
    //	setSelectedAction({})
    //}
    //setUpdate(authenticationOption.id)

    /*
			{selectedAction.authentication.map(data => (
			<MenuItem key={data.id} style={{backgroundColor: inputColor, color: "white"}} value={data}>
		*/
  };

  const handleScopeChange = (event) => {
    const {
      target: { value },
    } = event;

    console.log("VALUE: ", value);

    // On autofill we get a the stringified value.
    setSelectedScopes(typeof value === "string" ? value.split(",") : value);
  };

  if (
    authenticationOption.label === null ||
    authenticationOption.label === undefined
  ) {
    authenticationOption.label = selectedApp.name + " authentication";
  }


	const autoAuthButton = 
		<Button
				fullWidth
				variant="contained"
				style={{
					marginBottom: 20, 
					marginTop: 20, 
					flex: 1,
					textTransform: "none",
					textAlign: "left",
					justifyContent: "flex-start",
					backgroundColor: "#ffffff",
					color: "#2f2f2f",
					borderRadius: theme.palette.borderRadius,
					minWidth:  300, 
					maxWidth: 300,
					maxHeight: 50,
					overflow: "hidden",
					border: `1px solid ${theme.palette.inputColor}`,
				}}
				color="primary"
				disabled={
					clientSecret.length > 0 || clientId.length > 0
				}
				fullWidth
				onClick={() => {
					// Hardcode some stuff?
					// This could prolly be added to the app itself with a "default" client ID 
					startOauth2Request()
				}}
				color="primary"
			>
				{buttonClicked ? (
					<CircularProgress style={{ color: "#f86a3e", width: 45, height: 45, margin: "auto", }} />
				) : (
					<span style={{display: "flex"}}>
						<img
							alt={selectedAction.app_name}
							style={{ margin: 4, minHeight: 30, maxHeight: 30, borderRadius: theme.palette.borderRadius, }}
							src={selectedAction.large_image}
						/>
						<Typography style={{ margin: 0, marginLeft: 10, marginTop: 5,}} variant="body1">
							One-click Login
						</Typography>
					</span>
				)}
			</Button>

	if (authButtonOnly === true) {
		return autoAuthButton
	}

  return (
    <div>
      <DialogTitle>
        <div style={{ color: "white" }}>
          Authentication for {selectedApp.name}
        </div>
      </DialogTitle>
      <DialogContent>
        <span style={{}}>
            Oauth2 requires a client ID and secret to authenticate, defined in the remote system. Your redirect URL is <b>{window.location.origin}/set_authentication</b>&nbsp;-&nbsp;
          <a
            target="_blank"
            rel="norefferer"
            href="/docs/apps#authentication"
            style={{ textDecoration: "none", color: "#f85a3e" }}
          >
            {" "}
            Learn more about Oauth2 with Shuffle
          </a>
          <div />
        </span>

				{isCloud && registeredApps.includes(selectedApp.name.toLowerCase()) ? 
					<span>
						<span style={{display: "flex"}}>
							{autoAuthButton}
							
							{buttonClicked ? 
								null
							:
								<Tooltip
									color="primary"
									title={"Force Admin Consent"}
									placement="top"
								>
									<Button
										fullWidth
										variant="outlined"
										style={{
											maxWidth: 50,
											marginBottom: 20, 
											marginTop: 20, 
											maxHeight: 50, 
										}}
										color="primary"
										disabled={
											clientSecret.length > 0 || clientId.length > 0
										}
										fullWidth
										onClick={() => {
											// Hardcode some stuff?
											// This could prolly be added to the app itself with a "default" client ID 
											//startOauth2Request(true)
											startOauth2Request()
										}}
										color="primary"
									>
										<SupervisorAccountIcon />
									</Button>
								</Tooltip>
							}
						</span>
						<Typography style={{textAlign: "center", marginTop: 0, marginBottom: 10, }}>
							OR
						</Typography>
					</span>
				: null}
        {/*<TextField
						style={{backgroundColor: theme.palette.inputColor, borderRadius: theme.palette.borderRadius,}} 
						InputProps={{
							style:{
								color: "white",
								marginLeft: "5px",
								maxWidth: "95%",
								height: 50, 
								fontSize: "1em",
							},
						}}
						fullWidth
						color="primary"
						placeholder={"Auth july 2020"}
						defaultValue={`Auth for ${selectedApp.name}`}
						onChange={(event) => {
							authenticationOption.label = event.target.value
						}}
					/>
				<Divider style={{marginTop: 15, marginBottom: 15, backgroundColor: "rgb(91, 96, 100)"}}/>
				*/}

        {!manuallyConfigure ? null : (
          <span>
            {selectedApp.authentication.parameters.map((data, index) => {
              //console.log(data, index)
              if (data.name === "client_id" || data.name === "client_secret") {
                return null;
              }

              if (data.name !== "url") {
                return null;
              }

              if (oauthUrl.length === 0) {
                setOauthUrl(data.value);
              }

              return (
                <div key={index} style={{ marginTop: 10 }}>
                  <LockOpenIcon style={{ marginRight: 10 }} />
                  <b>{data.name}</b>

                  {data.schema !== undefined &&
                  data.schema !== null &&
                  data.schema.type === "bool" ? (
                    <Select
                      SelectDisplayProps={{
                        style: {
                          marginLeft: 10,
                        },
                      }}
                      defaultValue={"false"}
                      fullWidth
                      onChange={(e) => {
                        console.log("Value: ", e.target.value);
                        authenticationOption.fields[data.name] = e.target.value;
                      }}
                      style={{
                        backgroundColor: theme.palette.surfaceColor,
                        color: "white",
                        height: 50,
                      }}
                    >
                      <MenuItem
                        key={"false"}
                        style={{
                          backgroundColor: theme.palette.inputColor,
                          color: "white",
                        }}
                        value={"false"}
                      >
                        false
                      </MenuItem>
                      <MenuItem
                        key={"true"}
                        style={{
                          backgroundColor: theme.palette.inputColor,
                          color: "white",
                        }}
                        value={"true"}
                      >
                        true
                      </MenuItem>
                    </Select>
                  ) : (
                    <TextField
                      style={{
                        backgroundColor: theme.palette.inputColor,
                        borderRadius: theme.palette.borderRadius,
                      }}
                      InputProps={{
                        style: {
                          color: "white",
                          marginLeft: "5px",
                          maxWidth: "95%",
                          height: 50,
                          fontSize: "1em",
                        },
                      }}
                      fullWidth
                      type={
                        data.example !== undefined &&
                        data.example.includes("***")
                          ? "password"
                          : "text"
                      }
                      color="primary"
                      defaultValue={
                        data.value !== undefined && data.value !== null
                          ? data.value
                          : ""
                      }
                      placeholder={data.example}
                      onChange={(event) => {
                        authenticationOption.fields[data.name] =
                          event.target.value;
                        console.log("Setting oauth url");
                        setOauthUrl(event.target.value);
                        //const [oauthUrl, setOauthUrl] = React.useState("")
                      }}
                    />
                  )}
                </div>
              );
            })}
            <TextField
              style={{
                marginTop: 20,
                backgroundColor: theme.palette.inputColor,
                borderRadius: theme.palette.borderRadius,
              }}
              InputProps={{
                style: {
                  color: "white",
                  marginLeft: "5px",
                  maxWidth: "95%",
                  fontSize: "1em",
                  height: "50px",
                },
              }}
              fullWidth
              color="primary"
              placeholder={"Client ID"}
              onChange={(event) => {
                setClientId(event.target.value);
                //authenticationOption.label = event.target.value
              }}
            />
            <TextField
              style={{
                backgroundColor: theme.palette.inputColor,
                borderRadius: theme.palette.borderRadius,
								marginBottom: 10, 
              }}
              InputProps={{
                style: {
                  color: "white",
                  marginLeft: "5px",
                  maxWidth: "95%",
                  fontSize: "1em",
                  height: "50px",
                },
              }}
              fullWidth
              color="primary"
              placeholder={"Client Secret"}
              onChange={(event) => {
                setClientSecret(event.target.value);
                //authenticationOption.label = event.target.value
              }}
            />
            {allscopes.length === 0 ? null : (
							<div style={{width: "100%", marginTop: 10, display: "flex"}}>
								<span>
									Scopes
									<Select
										multiple
										value={selectedScopes}
										style={{
											backgroundColor: theme.palette.inputColor,
											color: "white",
											padding: 5, 
											minWidth: 300,
											maxWidth: 300,
										}}
										onChange={(e) => {
											handleScopeChange(e)
										}}
										fullWidth
										input={<Input id="select-multiple-native" />}
										renderValue={(selected) => selected.join(", ")}
										MenuProps={MenuProps}
									>
										{allscopes.map((data, index) => {
											return (
												<MenuItem key={index} value={data}>
													<Checkbox checked={selectedScopes.indexOf(data) > -1} />
													<ListItemText primary={data} />
												</MenuItem>
											);
										})}
									</Select>
								</span>
								<span>
									<Tooltip
										color="primary"
										title={"Automatic Refresh (default: true)"}
										placement="top"
									>
										<Checkbox style={{paddingTop: 20}} color="secondary" checked={offlineAccess} onClick={() => {
											setOfflineAccess(!offlineAccess)
										}}/>
									</Tooltip>
								</span>
							</div>
            )}
          </span>
        )}
        <Button
          style={{
            marginBottom: 40,
            marginTop: 20,
            borderRadius: theme.palette.borderRadius,
          }}
          disabled={
            clientSecret.length === 0 || clientId.length === 0 || buttonClicked || selectedScopes.length === 0
          }
          variant="contained"
          fullWidth
          onClick={() => {
            handleOauth2Request(
              clientId,
              clientSecret,
              oauthUrl,
              selectedScopes
            );
          }}
          color="primary"
        >
          {buttonClicked ? (
            <CircularProgress style={{ color: "white" }} />
          ) : (
            "Manually Authenticate"
          )}
        </Button>



        {defaultConfigSet ? (
          <span style={{}}>
            ... or
            <Button
              style={{
                marginLeft: 10,
                borderRadius: theme.palette.borderRadius,
              }}
              disabled={clientSecret.length === 0 || clientId.length === 0}
              variant="text"
              onClick={() => {
                setManuallyConfigure(!manuallyConfigure);

                if (manuallyConfigure) {
                  setClientId(authenticationType.client_id);
                  setClientSecret(authenticationType.client_secret);
                } else {
                  setClientId("");
                  setClientSecret("");
                }
              }}
              color="primary"
            >
              {manuallyConfigure
                ? "Use auto-config"
                : "Manually configure Oauth2"}
            </Button>
          </span>
        ) : null}
      </DialogContent>
    </div>
  );
};

export default AuthenticationOauth2;
